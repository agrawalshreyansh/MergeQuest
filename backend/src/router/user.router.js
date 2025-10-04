import express from 'express';
import {
  createUser,
  getUserByGithubId,
  getAllUsers,
  updateUserPoints,
  deleteUser,
  syncUser
} from '../controller/user.controller.js';

const router = express.Router();

router.post('/auth', createUser);
router.get('/leaderboard', getAllUsers);
router.get('/user/:github_id', getUserByGithubId);
router.patch('/:id/points', updateUserPoints);
router.patch('/:id/sync', syncUser);
router.delete('/:id', deleteUser);

export default router;
