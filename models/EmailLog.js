const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema({
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, default: "sent" },
  error: String
});

module.exports = mongoose.model("EmailLog", emailLogSchema);
