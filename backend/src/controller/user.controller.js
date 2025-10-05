import User from '../models/user.model.js';
import Badge from '../models/badges.model.js';

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

// Function to calculate contribution streaks
const calculateStreaks = (contributionCalendar) => {
  if (!contributionCalendar || !contributionCalendar.weeks) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Flatten all contribution days and sort by date
  const allDays = [];
  contributionCalendar.weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      allDays.push({
        date: new Date(day.date),
        count: day.contributionCount
      });
    });
  });

  // Sort by date (newest first for current streak calculation)
  allDays.sort((a, b) => b.date - a.date);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Calculate current streak (from today backwards)
  for (let i = 0; i < allDays.length; i++) {
    const day = allDays[i];
    const dayDate = new Date(day.date);
    
    if (i === 0) {
      // Check if today or yesterday has contributions
      if (day.count > 0 && (
        dayDate.toDateString() === today.toDateString() || 
        dayDate.toDateString() === yesterday.toDateString()
      )) {
        currentStreak = 1;
      } else if (day.count === 0) {
        break;
      }
    } else {
      const prevDay = allDays[i - 1];
      const prevDate = new Date(prevDay.date);
      const expectedDate = new Date(prevDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
      
      if (day.count > 0 && dayDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  allDays.sort((a, b) => a.date - b.date); // Sort chronologically for longest streak
  
  for (let i = 0; i < allDays.length; i++) {
    if (allDays[i].count > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
};

export const createUser = async (req, res) => {
  
  try {
    const { code } = req.body;
    if (!code) {
      console.log('No authorization code provided');
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'GitHub OAuth configuration is missing'
      });
    }

    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    if (!tokenResponse.ok) {
      console.error('GitHub token exchange failed:', tokenResponse.status, tokenResponse.statusText);
      return res.status(400).json({
        success: false,
        message: 'Failed to exchange authorization code for access token'
      });
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData);
      return res.status(400).json({
        success: false,
        message: `GitHub OAuth error: ${tokenData.error_description || tokenData.error}`
      });
    }

    const access_token = tokenData.access_token;
    
    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: 'Failed to receive access token from GitHub'
      });
    }

    // Fetch user data from GitHub
    const githubUserResponse = await fetch(GITHUB_USER_URL, {
      headers: {
        'Authorization': `token ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MergeQuest-App'
      }
    });

    if (!githubUserResponse.ok) {
      console.error('GitHub user fetch failed:', githubUserResponse.status, githubUserResponse.statusText);
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch user data from GitHub'
      });
    }
    
    const userData = await githubUserResponse.json();
    
    const { login: github_id, name, avatar_url } = userData;

    if (!github_id) {
      console.error('Missing github_id in user data:', userData);
      return res.status(400).json({
        success: false,
        message: 'Failed to get required user data from GitHub'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ github_id }]
    });

    if (existingUser) {
      // Format existing user data properly
      const existingUserResponse = {
        id: existingUser._id ? existingUser._id.toString() : null,
        github_id: existingUser.github_id || null,
        name: existingUser.name || null,
        avatar_url: existingUser.avatar_url || null,
        total_points: existingUser.total_points || 0,
        last_synced_at: existingUser.last_synced_at || null,
        createdAt: existingUser.createdAt || null,
        updatedAt: existingUser.updatedAt || null
      };

      console.log('Existing user found:', existingUserResponse);
      
      const finalResponse = {
        success: true,
        message: 'User already exists with this GitHub ID',
        data: existingUserResponse
      };
      
      console.log('Sending existing user response:', finalResponse);
      res.set('Content-Type', 'application/json');
      return res.status(200).json(finalResponse);
    }
    
    const newUser = new User({
      github_id,
      name,
      avatar_url,
      access_token,
      total_points: 0
    });

    const savedUser = await newUser.save();

    if (!savedUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save user to database'
      });
    }

    const userResponse = {
      id: savedUser._id ? savedUser._id.toString() : null,
      github_id: savedUser.github_id || null,
      name: savedUser.name || null,
      avatar_url: savedUser.avatar_url || null,
      total_points: savedUser.total_points || 0,
      last_synced_at: savedUser.last_synced_at || null,
      createdAt: savedUser.createdAt || null,
      updatedAt: savedUser.updatedAt || null
    };

    console.log('New user created:', userResponse);

    const finalResponse = {
      success: true,
      message: 'User created successfully',
      data: userResponse
    };
    
    console.log('Sending new user response:', finalResponse);
    res.set('Content-Type', 'application/json');
    return res.status(201).json(finalResponse);

  } catch (error) {
    console.error('=== Error in createUser function ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    if (error.code === 11000) {
      const duplicateResponse = {
        success: false,
        message: 'User already exists with this GitHub ID'
      };
      console.log('Sending duplicate user response:', duplicateResponse);
      res.set('Content-Type', 'application/json');
      return res.status(409).json(duplicateResponse);
    }

    const errorResponse = {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
    
    console.log('Sending error response:', errorResponse);
    res.set('Content-Type', 'application/json');
    return res.status(500).json(errorResponse);
  }
};

export const getUserByGithubId = async (req, res) => {
  try {
    const { github_id } = req.params;

    // Find user and include access_token for GitHub API calls
    const user = await User.findOne({ github_id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // GraphQL query to get repository contribution data
    const query = `
    {
      user(login: "${github_id}") {
        repositoriesContributedTo(contributionTypes: [PULL_REQUEST], first: 1) {
          totalCount
        }
        repositories(first: 1, isFork: true) {
          totalCount
        }
        pullRequests(first: 1) {
          totalCount
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
    `;

    try {
      // Call GitHub GraphQL API
      const githubResponse = await fetch(GITHUB_GRAPHQL_API, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
      });

      const githubData = await githubResponse.json();
      
      const userResponse = {
        _id: user._id,
        last_synced_at: user.last_synced_at,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      if (githubData.data && githubData.data.user) {
        // Calculate streaks from contribution data
        const streaks = calculateStreaks(githubData.data.user.contributionsCollection?.contributionCalendar);
        
        userResponse.github_stats = {
          repositories_contributed_to: githubData.data.user.repositoriesContributedTo.totalCount,
          forked_repositories: githubData.data.user.repositories.totalCount,
          total_pull_requests: githubData.data.user.pullRequests.totalCount,
          total_contributions: githubData.data.user.contributionsCollection?.contributionCalendar?.totalContributions || 0,
          current_streak: streaks.currentStreak,
          longest_streak: streaks.longestStreak
        };
      }

      res.status(200).json({
        success: true,
        data: userResponse
      });

    } catch (githubError) {
      console.error('Error fetching GitHub data:', githubError);
      
      // Return user data without GitHub stats if API call fails
      const userResponse = {
        _id: user._id,
        github_id: user.github_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        total_points: user.total_points,
        last_synced_at: user.last_synced_at,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.status(200).json({
        success: true,
        data: userResponse,
        warning: 'GitHub statistics could not be fetched'
      });
    }

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('github_id avatar_url total_points name')
      .sort({ total_points: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const usersWithBadges = await Promise.all(
      users.map(async (user) => {
        const badges = await Badge.find({ user: user._id })
          .select('badge')
          .lean();
        
        return {
          ...user.toObject(),
          badges: badges.map(badge => badge.badge)
        };
      })
    );

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: usersWithBadges,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateUserPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;

    if (typeof points !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Points must be a number'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        $inc: { total_points: points },
        last_synced_at: new Date()
      },
      { new: true, runValidators: true }
    ).select('-access_token');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User points updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Error updating user points:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const syncUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { last_synced_at: new Date() },
      { new: true }
    ).select('-access_token');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User synced successfully',
      data: user
    });

  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user points statistics by GitHub ID
