import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: String,
    required: true,
    enum: [
      'Newbie Committer',
      'Rising Contributor',
      'Issue Solver',
      'Merge Artisian',
      'PR Ninja',
      'Open Source Expert',
      'Open Source Guru',
      'Open Source Samurai',
    ]
  }
}, {
  timestamps: true 
});

badgeSchema.index({ user: 1, badge: 1 }, { unique: true });

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;