import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  github_id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
},
  name : {
    type: String, 
  },
  avatar_url: {
    type: String,
    required: true
  },
  access_token: {
    type: String,
    required: true
  },
  total_points: {
    type: Number,
    default: 0
  },
  last_synced_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Index for better query performance
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

export default User;