import mongoose from 'mongoose';

const pullRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repo_name: {
    type: String,
    required: true
  },
  pr_number: {
    type: Number,
    required: true
  },
  pull_points: {
    type: Number,
    default: 0
  },
  merge_points: {
    type: Number,
    default: 0
  },
  pull_created_at: {
    type: Date,
    required: true
  },
  merged_at: {
    type: Date,
    default: null
  },
  request_url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  state: {
    type: String,
    enum: ['open', 'closed', 'merged'],
    default: 'open'
  },
  additions: {
    type: Number,
    default: 0
  },
  deletions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true 
});

pullRequestSchema.index({ repo_name: 1, pr_number: 1 }, { unique: true });

pullRequestSchema.index({ user: 1 });

pullRequestSchema.index({ pr_at: -1 });

pullRequestSchema.index({ merged_at: -1 });

const PullRequest = mongoose.model('PullRequest', pullRequestSchema);

export default PullRequest;