require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("./models/Contact");
const EmailLog = require("./models/EmailLog");

async function checkStatus() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = "kartikeya.raj29@gmail.com";
    const contact = await Contact.findOne({ email });
    const logs = await EmailLog.find({ contactId: contact?._id }).sort({ sentAt: -1 });

    console.log("Contact Status:", contact ? contact.stage : "Not Found");
    console.log("Logs Count:", logs.length);
    if (logs.length > 0) {
      console.log("Latest Log Status:", logs[0].status);
      console.log("Latest Log Error:", logs[0].error || "None");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
checkStatus();
