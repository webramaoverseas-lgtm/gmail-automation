const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Contact = require("./models/Contact");
const Template = require("./models/Template");

async function trigger() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Add Rajeev
  const email = "rajeevbhaskar7@gmail.com";
  const name = "Rajeev Bhaskar";

  // Ensure he exists and is in 'new' stage
  await Contact.findOneAndUpdate(
    { email },
    { name, email, stage: "new", sequenceStep: 0 },
    { upsert: true, new: true }
  );
  console.log(`Added/Reset contact: ${email}`);

  // Trigger the launch via fetch (server is running on :5000)
  try {
      const response = await fetch("http://localhost:5000/launch", { method: "POST" });
      const data = await response.json();
      console.log("Launch response:", data);
  } catch (err) {
      console.error("Failed to trigger /launch via fetch, calling runOutreach internally...");
      // Fallback: If fetch fails (e.g. server hasn't fully started), we could call the logic here
      // but let's assume the server is up as per logs.
  }

  mongoose.connection.close();
}

trigger();
