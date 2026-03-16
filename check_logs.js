const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const EmailLog = require("./models/EmailLog");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const logs = await EmailLog.find().sort({ sentAt: -1 }).limit(5);
  console.log("Latest Logs:", JSON.stringify(logs, null, 2));
  mongoose.connection.close();
}

check();
