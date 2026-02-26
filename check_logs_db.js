require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("./models/Contact");
const EmailLog = require("./models/EmailLog");

async function checkDetails() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const stats = await Contact.countDocuments({});
    const contacted = await Contact.countDocuments({ stage: "contacted" });
    console.log(`Total Contacts: ${stats}`);
    console.log(`Contacts marked CONTACTED: ${contacted}`);

    const logs = await EmailLog.find({}).sort({ sentAt: -1 }).limit(10);
    console.log("\nLast 10 Email Logs:");
    logs.forEach(log => {
      console.log(`- Time: ${log.sentAt}, Contact: ${log.contactId}, Status: ${log.status}, Error: ${log.error || 'None'}`);
    });

  } catch (err) {
    console.error("Diagnostic Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

checkDetails();
