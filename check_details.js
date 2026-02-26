require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("./models/Contact");
const EmailLog = require("./models/EmailLog");

async function checkDetails() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = "kartikeya.raj29@gmail.com";
    const contact = await Contact.findOne({ email });
    
    if (!contact) {
      console.log("Contact not found");
      return;
    }

    console.log("Contact Details:");
    console.log("- Stage:", contact.stage);
    console.log("- Replied Flag:", contact.replied);
    console.log("- Last Sent At:", contact.lastSentAt);
    console.log("- Reply History Total:", contact.replyHistory.length);
    if (contact.replyHistory.length > 0) {
      console.log("- Latest Snippet:", contact.lastReplySnippet);
    }

    const logs = await EmailLog.find({ contactId: contact._id }).sort({ sentAt: 1 });
    console.log("\nEmail Logs:");
    logs.forEach((l, i) => {
      console.log(`${i+1}. [${l.sentAt.toLocaleTimeString()}] Status: ${l.status}, Error: ${l.error || "N/A"}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
checkDetails();
