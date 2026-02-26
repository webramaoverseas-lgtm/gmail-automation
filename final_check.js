require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("./models/Contact");
const EmailLog = require("./models/EmailLog");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const total = await Contact.countDocuments();
  const stages = await Contact.aggregate([{ $group: { _id: "$stage", count: { $sum: 1 } } }]);
  const samples = await Contact.find().limit(10);
  const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(10);

  console.log("--- DB STATUS REPORT ---");
  console.log("Total Contacts:", total);
  console.log("Stages:", JSON.stringify(stages, null, 2));
  console.log("Sample Contacts:", JSON.stringify(samples.map(s => ({ name: s.name, email: s.email, stage: s.stage })), null, 2));
  console.log("Recent Email Logs:", JSON.stringify(logs, null, 2));
  
  process.exit(0);
}

check();
