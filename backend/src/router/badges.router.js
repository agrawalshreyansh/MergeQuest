import express from 'express';
import {
  awardBadge,
  getUserBadges,
  revokeBadge,
  getAvailableBadges,
  getUserPointsStats
} from '../controller/badges.controller.js';

const router = express.Router();

// Award a badge to a user
router.post('/award', awardBadge);

// Get all available badge types
router.get('/available', getAvailableBadges);

// Get all badges for a specific user
router.get('/user/:userId', getUserBadges);

// Get user points statistics by GitHub ID
router.get('/stats/:github_id', getUserPointsStats);

// Revoke a specific badge
router.delete('/:badgeId', revokeBadge);

export default router;
