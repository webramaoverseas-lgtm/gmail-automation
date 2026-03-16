require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("./models/Contact");

async function resetReplies() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Reset all contacts who are marked as replied but we want to clear them for testing
    const result = await Contact.updateMany(
      { email: "kartikeya.raj29@gmail.com" },
      { 
        replied: false, 
        sentiment: "neutral",
        lastReplySnippet: null
      }
    );

    console.log(`Updated ${result.modifiedCount} contact(s).`);
    console.log("✅ Replied status reset for kartikeya.raj29@gmail.com");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

resetReplies();
