const fs = require("fs");
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("./models/Contact");
const EmailLog = require("./models/EmailLog");
const Template = require("./models/Template");
const { fillTemplate } = require("./templateEngine");
const nodemailer = require("nodemailer");

async function sendPremiumTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Path to the cleaned template artifact
    const templatePath = path.join("C:", "Users", "Kartikeya Raj", ".gemini", "antigravity", "brain", "b11c34b2-493a-4da2-8fbf-21e883e96e7e", "final_premium_template.html");
    const finalHtml = fs.readFileSync(templatePath, "utf8");

    // 1. Update/Seed the template in DB
    await Template.findOneAndUpdate(
      { name: "Premium Outreach" },
      { 
        name: "Premium Outreach",
        subject: "One quick observation for Your Business",
        htmlBody: finalHtml,
        order: 1,
        delayDays: 0
      },
      { upsert: true, new: true }
    );
    console.log("Updated 'Premium Outreach' template in database.");

    // 2. Erase all other data
    await Contact.deleteMany({});
    await EmailLog.deleteMany({});
    console.log("Cleared all existing contacts and logs.");

    // 3. Add single contact
    const testContact = await Contact.create({
      name: "Kartikeya",
      email: "kartikeya.raj29@gmail.com",
      stage: "new"
    });
    console.log("Added test contact: kartikeya.raj29@gmail.com");

    const template = await Template.findOne({ name: "Premium Outreach" });
    if (!template) throw new Error("Template not found!");

    const html = fillTemplate(template.htmlBody, { name: testContact.name });
    const subject = fillTemplate(template.subject, { name: testContact.name });

    // 4. Send via Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log("Sending premium email directly via Nodemailer...");
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: testContact.email,
      subject: subject,
      html: html
    });

    console.log("✅ Email sent successfully to kartikeya.raj29@gmail.com");
    
    testContact.stage = "contacted";
    testContact.lastSentAt = new Date();
    await testContact.save();

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

sendPremiumTest();

