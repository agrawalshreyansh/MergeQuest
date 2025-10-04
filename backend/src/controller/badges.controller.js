import Badge from '../models/badges.model.js';
import User from '../models/user.model.js';

// Award a badge to a user
export const awardBadge = async (req, res) => {
  try {
    const { userId, badge } = req.body;

    // Validate required fields
    if (!userId || !badge) {
      return res.status(400).json({
        success: false,
        message: 'User ID and badge are required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if badge is valid
    const validBadges = [
      'Newbie Committer',
      'Rising Contributor',
      'Issue Solver',
      'Merge Artisian',
      'PR Ninja',
      'Open Source Expert',
      'Open Source Guru',
      'Open Source Samurai'
    ];

    if (!validBadges.includes(badge)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid badge type',
        validBadges
      });
    }

    // Check if user already has this badge
    const existingBadge = await Badge.findOne({ user: userId, badge });
    if (existingBadge) {
      return res.status(409).json({
        success: false,
        message: 'User already has this badge'
      });
    }

    // Create new badge
    const newBadge = new Badge({
      user: userId,
      badge
    });

    const savedBadge = await newBadge.save();
    await savedBadge.populate('user', 'github_id name avatar_url');

    res.status(201).json({
      success: true,
      message: 'Badge awarded successfully',
      data: savedBadge
    });

  } catch (error) {
    console.error('Error awarding badge:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User already has this badge'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all badges for a specific user
export const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const badges = await Badge.find({ user: userId })
      .populate('user', 'github_id name avatar_url')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          github_id: user.github_id,
          name: user.name,
          avatar_url: user.avatar_url
        },
        badges: badges.map(badge => ({
          id: badge._id,
          badge: badge.badge,
          awardedAt: badge.createdAt
        })),
        totalBadges: badges.length
      }
    });

  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Revoke a badge from a user
export const revokeBadge = async (req, res) => {
  try {
    const { badgeId } = req.params;

    const badge = await Badge.findByIdAndDelete(badgeId)
      .populate('user', 'github_id name avatar_url');

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Badge revoked successfully',
      data: {
        revokedBadge: badge.badge,
        user: badge.user
      }
    });

  } catch (error) {
    console.error('Error revoking badge:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get available badge types
export const getAvailableBadges = async (req, res) => {
  try {
    const availableBadges = [
      {
        name: 'Newbie Committer',
        description: 'Awarded for making your first commit',
        level: 'Beginner'
      },
      {
        name: 'Rising Contributor',
        description: 'Awarded for consistent contributions',
        level: 'Intermediate'
      },
      {
        name: 'Issue Solver',
        description: 'Awarded for resolving issues',
        level: 'Intermediate'
      },
      {
        name: 'Merge Artisian',
        description: 'Awarded for successful pull request merges',
        level: 'Intermediate'
      },
      {
        name: 'PR Ninja',
        description: 'Awarded for exceptional pull request skills',
        level: 'Advanced'
      },
      {
        name: 'Open Source Expert',
        description: 'Awarded for significant open source contributions',
        level: 'Expert'
      },
      {
        name: 'Open Source Guru',
        description: 'Awarded for mastery in open source development',
        level: 'Master'
      },
      {
        name: 'Open Source Samurai',
        description: 'Awarded for legendary open source achievements',
        level: 'Legendary'
      }
    ];

    res.status(200).json({
      success: true,
      data: availableBadges
    });

  } catch (error) {
    console.error('Error fetching available badges:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUserPointsStats = async (req, res) => {
  try {
    const { github_id } = req.params;

    const user = await User.findOne({ github_id }).select('github_id name avatar_url total_points');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all pull requests for this user
    const pullRequests = await PullRequest.find({ user: user._id })
      .sort({ createdAt: 1 })
      .lean();

    // Create simplified array for frontend graph
    const pointsHistory = pullRequests.map(pr => ({
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
      total_points: (pr.pull_points || 0) + (pr.merge_points || 0)
    }));

    res.status(200).json({
      success: true,
      data: pointsHistory
    });

  } catch (error) {
    console.error('Error fetching user points stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
