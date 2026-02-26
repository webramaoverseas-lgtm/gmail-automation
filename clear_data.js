require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("./models/Contact");
const EmailLog = require("./models/EmailLog");

async function clearData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const contactsDeleted = await Contact.deleteMany({});
    const logsDeleted = await EmailLog.deleteMany({});

    console.log(`Cleared ${contactsDeleted.deletedCount} contacts.`);
    console.log(`Cleared ${logsDeleted.deletedCount} email logs.`);

  } catch (err) {
    console.error("Cleanup Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

clearData();
