import User from '../models/user.model.js';
import Badge from '../models/badges.model.js';

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

export const createUser = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
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
      return res.status(400).json({
        success: false,
        message: 'Failed to exchange authorization code for access token'
      });
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return res.status(400).json({
        success: false,
        message: `GitHub OAuth error: ${tokenData.error_description || tokenData.error}`
      });
    }

    const access_token = tokenData.access_token;

    // Fetch user data from GitHub
    const githubUserResponse = await fetch(GITHUB_USER_URL, {
      headers: {
        'Authorization': `token ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MergeQuest-App'
      }
    });

    if (!githubUserResponse.ok) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch user data from GitHub'
      });
    }
    const userData = await githubUserResponse.json();
    
    const { login : github_id, name, avatar_url } = userData;

    console.log(userData)

    if (!github_id) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get required user data from GitHub'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ github_id }]
    });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'User already exists with this GitHub ID or email',
        data : existingUser
      });
    }

    const newUser = new User({
      github_id,
      name,
      avatar_url,
      access_token,
      total_points: 0
    });

    const savedUser = await newUser.save();

    const userResponse = {
      id: savedUser._id,
      github_id: savedUser.github_id,
      name: savedUser.name,
      avatar_url: savedUser.avatar_url,
      total_points: savedUser.total_points,
      last_synced_at: savedUser.last_synced_at,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });

  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this GitHub ID or email'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUserByGithubId = async (req, res) => {
  try {
    const { github_id } = req.params;

    const user = await User.findOne({ github_id }).select('-access_token');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

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
