const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },

  stage: {
    type: String,
    enum: ["new", "contacted", "re-engaged", "interested", "lto", "converted"],
    default: "new"
  },

  sequenceStep: {
    type: Number,
    default: 0 // 0: Welcome, 1: Followup 1 (Re-engage/Conversion), 2: Followup 2 (Conversion/LTO)
  },

  replied: {
    type: Boolean,
    default: false
  },

  repliedAt: Date,
  lastReplySnippet: String,
  replyHistory: [{
    body: String,
    date: { type: Date, default: Date.now }
  }],
  lastSentAt: Date,
  nextFollowUpAt: Date,
  optedOut: {
    type: Boolean,
    default: false
  },

  sentiment: {
    type: String,
    enum: ["neutral", "positive", "negative"],
    default: "neutral"
  }
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);