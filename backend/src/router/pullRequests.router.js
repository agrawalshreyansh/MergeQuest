import express from 'express';
import {
  getUserPRs
} from '../controller/pullrequest.controller.js';

const router = express.Router();

router.use('/:username', getUserPRs);

export default router;
