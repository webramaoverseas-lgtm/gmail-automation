require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Template = require("./models/Template");

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    let premiumTemplate = await Template.findOne({ name: "Premium Outreach" });
    
    if (!premiumTemplate) {
      console.log("❌ Premium Outreach template NOT found. Seeding now...");
      
      // Read HTML from the premium.html artifact (I'll assume it's in the same project for this script or use the artifact path)
      const artifactPath = "C:\\Users\\Kartikeya Raj\\.gemini\\antigravity\\brain\\b11c34b2-493a-4da2-8fbf-21e883e96e7e\\premium.html";
      let htmlBody = fs.readFileSync(artifactPath, "utf-8");
      
      // Add necessary styles and placeholders if needed
      // Actually, I'll just use the HTML as is, but replace the heroImage placeholder
      htmlBody = htmlBody.replace("{{heroImage}}", "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop");

      await Template.create({
        name: "Premium Outreach",
        order: 4,
        delayDays: 0,
        subject: "Your Collection Looks Premium, {{name}}",
        htmlBody: htmlBody
      });
      console.log("✅ Premium Outreach template seeded successfully!");
    } else {
      console.log("✅ Premium Outreach template already exists!");
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error during verification/seeding:", err);
  }
}

verify();
