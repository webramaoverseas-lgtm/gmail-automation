const mongoose = require("mongoose");
const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.mdrrdu9.mongodb.net/gmailAutomation?retryWrites=true&w=majority";

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  htmlBody: { type: String, required: true },
  order: { type: Number, required: true },
  delayDays: { type: Number, default: 3 }
});

const Template = mongoose.model("Template", templateSchema);

async function seed() {
  try {
    console.log("Connecting to Mongo (Hardcoded)...");
    await mongoose.connect(MONGO_URI, { connectTimeoutMS: 10000 });
    console.log("Connected Successfully!");

    await Template.deleteMany({});
    console.log("Old templates cleared.");

    const defaults = [
      { 
        name: "Welcome", 
        order: 0, 
        delayDays: 0, 
        subject: "Quick question for you, {{name}}", 
        htmlBody: "Professional Welcome Body..." 
      },
      { 
        name: "Re-engagement", 
        order: 1, 
        delayDays: 3, 
        subject: "Did you see my last email, {{name}}?", 
        htmlBody: "Professional Re-engagement Body..." 
      },
      { 
        name: "Conversion", 
        order: 2, 
        delayDays: 3, 
        subject: "Exclusive Strategy for {{name}}", 
        htmlBody: "Professional Conversion Body..." 
      },
      { 
        name: "Limited Time Offer", 
        order: 3, 
        delayDays: 3, 
        subject: "Last Chance: 50% Off Development for {{name}}", 
        htmlBody: "Professional LTO Body..." 
      }
    ];

    await Template.insertMany(defaults);
    console.log("Success! 4 templates inserted.");
    process.exit(0);
  } catch (err) {
    console.error("FATAL ERROR:", err);
    process.exit(1);
  }
}

seed();
