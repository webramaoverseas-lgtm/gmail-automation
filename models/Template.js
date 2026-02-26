const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  htmlBody: { type: String, required: true },
  order: { type: Number, required: true },
  delayDays: { type: Number, default: 3 }
});

module.exports = mongoose.model("Template", templateSchema);