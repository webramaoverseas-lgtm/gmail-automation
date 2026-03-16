require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("./models/Contact");
const Template = require("./models/Template");
const { sendEmail } = require("./mailer");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const email = "rajeevbhaskar7@gmail.com";
    const name = "Rajeev"; // Default name for the placeholder

    // 1. Add/Update Contact
    let contact = await Contact.findOne({ email });
    if (!contact) {
      contact = new Contact({
        name,
        email,
        stage: "new"
      });
      await contact.save();
      console.log(`Added new contact: ${email}`);
    } else {
      console.log(`Contact ${email} already exists. Setting stage to 'new' for outreach.`);
      contact.stage = "new";
      await contact.save();
    }

    // 2. Get Welcome Template (Premium Outreach)
    const welcomeTemplate = await Template.findOne({ name: "Welcome" });
    if (!welcomeTemplate) {
      console.error("Welcome template not found! Please ensure server is running and seeded.");
      process.exit(1);
    }

    // 3. Fill Template
    const fillTemplate = (text, data) => {
      let result = text;
      for (const key in data) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), data[key]);
      }
      return result;
    };

    const html = fillTemplate(welcomeTemplate.htmlBody, { name: contact.name });
    const subject = fillTemplate(welcomeTemplate.subject, { name: contact.name });

    // 4. Send Email
    console.log(`Sending welcome email to ${email}...`);
    const result = await sendEmail({
      to: email,
      subject: subject,
      body: html,
      isHtml: true
    });

    if (result.success) {
      console.log("✅ Welcome email sent successfully!");
      contact.stage = "contacted";
      contact.lastSentAt = new Date();
      await contact.save();
    } else {
      console.error("❌ Failed to send email:", result.error);
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
