import express from 'express';
import cors from 'cors';
import userRouter from './router/user.router.js';
import cookieParser from "cookie-parser"
import badgesRouter from './router/badges.router.js';
// import pullRequestsRouter from './router/pullRequests.router.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(cookieParser())
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static("public"))


app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/users', userRouter);
app.use('/api/badges', badgesRouter);
// app.use('/api/pullrequests', pullRequestsRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to MergeQuest API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      badges: '/api/badges',
      pullRequests: '/api/pull-requests',
      health: '/api/health'
    }
  });
});




export { app };