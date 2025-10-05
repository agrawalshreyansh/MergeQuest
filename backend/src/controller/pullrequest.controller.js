import User from '../models/user.model.js';

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

    res.status(200).json({ success: true, data: pullRequests });
  } catch (err) {
    console.error("Error fetching user PRs:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
