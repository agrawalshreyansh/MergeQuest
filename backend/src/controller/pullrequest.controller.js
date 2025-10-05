import User from '../models/user.model.js';
import PullRequest from '../models/pullRequests.model.js';
import Badge from '../models/badges.model.js';

export const getUserPRs = async (req, res) => {
  const { username } = req.params;
  const GITHUB_API = "https://api.github.com/graphql";

  try {
    // Find user by username to get their access token
    const user = await User.findOne({ github_id : username });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: `User '${username}' not found in database` 
      });
    }

    if (!user.access_token) {
      return res.status(401).json({ 
        success: false, 
        message: "User's GitHub access token not found. Please re-authenticate." 
      });
    }

    const TOKEN = user.access_token;

    const query = `
    {
      user(login: "${username}") {
        pullRequests(first: 100, states: [OPEN, CLOSED, MERGED]) {
          nodes {
            title
            url
            state
            merged
            createdAt
            updatedAt
            repository {
              name
              owner {
                login
              }
            }
            additions
            deletions
            changedFiles
          }
        }
      }
    }
    `;

    const response = await fetch(GITHUB_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({ 
          success: false, 
          message: "GitHub authentication failed. Please check your GitHub token permissions and validity." 
        });
      }
      throw new Error(`GitHub API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Check for GraphQL errors
    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return res.status(400).json({ 
        success: false, 
        message: "GraphQL query failed", 
        errors: data.errors 
      });
    }

    // Check if data structure exists
    if (!data.data) {
      console.error("No data in response:", data);
      return res.status(500).json({ 
        success: false, 
        message: "Invalid response structure from GitHub API" 
      });
    }

    // Check if user exists
    if (!data.data.user) {
      return res.status(404).json({ 
        success: false, 
        message: `User '${username}' not found on GitHub` 
      });
    }

    // Extract pull requests array directly from the nested structure
    const pullRequests = data.data.user.pullRequests.nodes;

    // Sync pull requests with database
    const syncResults = await syncPullRequestsWithDatabase(user._id, pullRequests);
    
    // Update user's badges based on current total points
    await updateUserBadges(user._id);
    
    res.status(200).json({ 
      success: true, 
      data: pullRequests,
      syncInfo: {
        updated: syncResults.updated,
        created: syncResults.created,
        total: pullRequests.length
      }
    });
  } catch (err) {
    console.error("Error fetching user PRs:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper function to sync pull requests with database
const syncPullRequestsWithDatabase = async (userId, fetchedPRs) => {
  let updated = 0;
  let created = 0;

  for (const pr of fetchedPRs) {
    try {
      // Extract PR number from URL (e.g., https://github.com/owner/repo/pull/123)
      const prNumber = parseInt(pr.url.split('/').pop());
      
      // Determine state and points based on GitHub's response
      let state = pr.state.toLowerCase();
      let pullPoints = 0;
      let mergePoints = 0;
      
      if (pr.merged) {
        state = 'merged';
        pullPoints = 5;   // 5 points for merged PRs
        mergePoints = 10; // 10 additional merge points
      } else if (state === 'closed') {
        pullPoints = -5;  // -5 points for closed (non-merged) PRs
        mergePoints = 0;
      } else if (state === 'open') {
        pullPoints = 0;   // No points for open PRs yet
        mergePoints = 0;
      }

      // Prepare PR data for database
      const prData = {
        user: userId,
        repo_name: `${pr.repository.owner.login}/${pr.repository.name}`,
        pr_number: prNumber,
        pull_points: pullPoints,
        merge_points: mergePoints,
        pull_created_at: new Date(pr.createdAt),
        merged_at: pr.merged ? new Date(pr.updatedAt) : null,
        request_url: pr.url,
        title: pr.title,
        state: state,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0
      };

      // Try to find existing PR
      const existingPR = await PullRequest.findOne({
        repo_name: prData.repo_name,
        pr_number: prData.pr_number
      });

      if (existingPR) {
        // Check if there are any changes
        const hasChanges = 
          existingPR.state !== prData.state ||
          existingPR.title !== prData.title ||
          existingPR.additions !== prData.additions ||
          existingPR.deletions !== prData.deletions ||
          existingPR.pull_points !== prData.pull_points ||
          existingPR.merge_points !== prData.merge_points ||
          (prData.merged_at && !existingPR.merged_at) ||
          (prData.merged_at && existingPR.merged_at && 
           new Date(existingPR.merged_at).getTime() !== new Date(prData.merged_at).getTime()) ||
          new Date(existingPR.pull_created_at).getTime() !== new Date(prData.pull_created_at).getTime();

        if (hasChanges) {
          // Calculate points difference for user total update
          const pointsDiff = (prData.pull_points + prData.merge_points) - 
                           (existingPR.pull_points + existingPR.merge_points);
          
          await PullRequest.findByIdAndUpdate(existingPR._id, prData);
          
          // Update user's total points if there's a difference
          if (pointsDiff !== 0) {
            await User.findByIdAndUpdate(userId, {
              $inc: { total_points: pointsDiff }
            });
          }
          
          updated++;
          console.log(`Updated PR: ${prData.repo_name}#${prData.pr_number} (Points: ${prData.pull_points + prData.merge_points})`);
        }
      } else {
        // Create new PR
        await PullRequest.create(prData);
        
        // Add points to user's total
        const totalNewPoints = prData.pull_points + prData.merge_points;
        if (totalNewPoints !== 0) {
          await User.findByIdAndUpdate(userId, {
            $inc: { total_points: totalNewPoints }
          });
        }
        
        created++;
        console.log(`Created new PR: ${prData.repo_name}#${prData.pr_number} (Points: ${totalNewPoints})`);
      }
    } catch (error) {
      console.error(`Error syncing PR ${pr.url}:`, error);
    }
  }

  return { updated, created };
};

// Helper function to update user badges based on total points
const updateUserBadges = async (userId) => {
  try {
    // Get user's current total points
    const user = await User.findById(userId);


    if (!user) {
      console.error('User not found for badge update');
      return;
    }

    const totalPoints = user.total_points || 0;

    console.log(totalPoints)
    
    // Define badge milestones in order (lowest to highest)
    const badgeMilestones = [
      { name: 'Newbie Committer', threshold: 10 },
      { name: 'Rising Contributor', threshold: 100 },
      { name: 'Issue Solver', threshold: 250 },
      { name: 'Merge Artisian', threshold: 500 },
      { name: 'PR Ninja', threshold: 750 },
      { name: 'Open Source Expert', threshold: 1000 },
      { name: 'Open Source Guru', threshold: 1250 },
      { name: 'Open Source Samurai', threshold: 1500 }
    ];

    // Get current user badges
    const existingBadges = await Badge.find({ user: userId });
    const existingBadgeNames = existingBadges.map(badge => badge.badge);

    // Determine which badges user should have based on total points
    const earnedBadges = badgeMilestones
      .filter(milestone => totalPoints >= milestone.threshold)
      .map(milestone => milestone.name);

    // Create badges that user has earned but doesn't have yet
    const badgesToCreate = earnedBadges.filter(badgeName => 
      !existingBadgeNames.includes(badgeName)
    );

    // Create new badges
    for (const badgeName of badgesToCreate) {
      try {
        await Badge.create({
          user: userId,
          badge: badgeName
        });
        console.log(`Awarded badge '${badgeName}' to user ${userId} (${totalPoints} points)`);
      } catch (error) {
        // Handle duplicate badge error (in case of race conditions)
        if (error.code === 11000) {
          console.log(`Badge '${badgeName}' already exists for user ${userId}`);
        } else {
          console.error(`Error creating badge '${badgeName}':`, error);
        }
      }
    }

    // Optional: Remove badges if user's points dropped below threshold
    // (Uncomment if you want badges to be revoked when points decrease)
    /*
    const badgesToRemove = existingBadgeNames.filter(badgeName => 
      !earnedBadges.includes(badgeName)
    );

    for (const badgeName of badgesToRemove) {
      await Badge.deleteOne({ user: userId, badge: badgeName });
      console.log(`Removed badge '${badgeName}' from user ${userId} (${totalPoints} points)`);
    }
    */

  } catch (error) {
    console.error('Error updating user badges:', error);
  }
};
