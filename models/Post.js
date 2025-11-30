const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like','dislike','comment'], required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  topics: [{ type: String, enum: ['Politics','Health','Sport','Tech'] }],
  owner: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['Live','Expired'], default: 'Live' },
  interactions: [InteractionSchema]
});

module.exports = mongoose.model('Post', PostSchema);
