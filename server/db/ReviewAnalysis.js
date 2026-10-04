const mongoose = require('mongoose');

const reviewAnalysisSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true,
    unique: true,
    index: true,
  },
  summary: {
    type: String,
    default: '',
  },
  overallSentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'mixed'],
    default: 'neutral',
  },
  sentimentDistribution: {
    positive: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    negative: { type: Number, default: 0 },
  },
  positiveHighlights: {
    type: [String],
    default: [],
  },
  negativeHighlights: {
    type: [String],
    default: [],
  },
  commonTopics: {
    type: [String],
    default: [],
  },
  actionableInsights: {
    type: [String],
    default: [],
  },
  analyzedReviewCount: {
    type: Number,
    default: 0,
  },
  lastAnalyzedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('review_analysis', reviewAnalysisSchema);
