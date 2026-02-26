require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const XLSX = require("xlsx");
const Contact = require("./models/Contact");
const Template = require("./models/Template");
const EmailLog = require("./models/EmailLog");
const { runScheduler } = require("./scheduler");
const { startReplyChecker } = require("./replyChecker");
const { fillTemplate } = require("./templateEngine");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

/* =========================
   MongoDB Connection
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo Connected");
    seedTemplates();
    runScheduler();
    startReplyChecker();
  })
  .catch(err => console.log("Mongo Error:", err));

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  logger: true,
  debug: true
});

/* =========================
   SEED DATA
========================= */
async function seedTemplates() {
  const count = await Template.countDocuments();
  if (count === 0) {
    const defaults = [
      { 
        name: "Welcome", 
        order: 0, 
        delayDays: 0, 
        subject: "Quick question for you, {{name}}", 
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <p>Hi {{name}},</p>
            <p>I noticed your brand online and was really impressed with your current presence. However, I think there's a huge opportunity you might be missing to turn more of your visitors into customers.</p>
            <p>At <strong>Digital Vibe</strong>, we specialize in building high-conversion websites and apps that don't just look pretty—they drive revenue.</p>
            <p>Would you be open to a 5-minute chat about how we can help you scale this year?</p>
            <p>Best,<br>The Digital Vibe Team</p>
          </div>
        ` 
      },
      { 
        name: "Re-engagement", 
        order: 1, 
        delayDays: 3, 
        subject: "Did you see my last email, {{name}}?", 
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <p>Hey {{name}},</p>
            <p>I know things get busy, so I'm just sliding this back to the top of your inbox.</p>
            <p>I genuinely believe we could help you double your conversion rate with a few simple tweaks to your tech stack.</p>
            <p>No pressure, but if you're interested in seeing some of our recent case studies, just hit reply!</p>
            <p>Cheers,<br>Digital Vibe Outreach</p>
          </div>
        ` 
      },
      { 
        name: "Conversion", 
        order: 2, 
        delayDays: 3, 
        subject: "Exclusive Strategy for {{name}}", 
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <p>Hi {{name}},</p>
            <p>Great to see you're still interested! Since you took the time to read my previous emails, I wanted to offer you something special.</p>
            <p>I've put together a <strong>free 15-minute audit</strong> specifically for your brand. We'll show you exactly where you're losing money and how to fix it.</p>
            <p>Reply with "YES" to book your session, or use this link: [Your Calendly Link]</p>
            <p>Let's make it happen!<br>Digital Vibe Success Team</p>
          </div>
        ` 
      },
      { 
        name: "Limited Time Offer", 
        order: 3, 
        delayDays: 3, 
        subject: "Last Chance: 50% Off Development for {{name}}", 
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <p>Hi {{name}},</p>
            <p>This will be my final email regarding this specific offer.</p>
            <p>We're looking to take on one more high-growth partner this month, and to make the decision easy, we're offering <strong>50% off</strong> our standard development fee if you sign up in the next 48 hours.</p>
            <p>If you want to scale your business for half the cost, this is your sign.</p>
            <p>Last call,<br>Digital Vibe Founder</p>
          </div>
        ` 
      }
    ];
    await Template.insertMany(defaults);
    console.log("Premium templates seeded.");
  }
}

/* =========================
   ROUTES
========================= */

// Health Check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "DigitalVibe Backend is running!" });
});

// SMTP Test
app.get("/test-email", async (req, res) => {
  try {
    await transporter.verify();
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: "SMTP Test Reachable",
      text: "If you see this, your Gmail SMTP is working!"
    });
    res.json({ success: true, message: "Test email sent!" });
  } catch (err) {
    console.error("SMTP Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tracking & Analytics
app.get("/analytics", async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const stats = {
      total,
      new: await Contact.countDocuments({ stage: "new" }),
      contacted: await Contact.countDocuments({ stage: "contacted" }),
      reengaged: await Contact.countDocuments({ stage: "re-engaged" }),
      interested: await Contact.countDocuments({ stage: "interested" }),
      lto: await Contact.countDocuments({ stage: "lto" }),
      replied: await Contact.countDocuments({ replied: true }),
      converted: await Contact.countDocuments({ stage: "converted" })
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/tracking", async (req, res) => {
  try {
    const contacts = await Contact.find({ 
        $or: [
            { replied: true },
            { lastReplySnippet: { $exists: true, $ne: null } }
        ]
    }).sort({ updatedAt: -1 }).limit(50);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Templates
app.get("/templates", async (req, res) => {
  const templates = await Template.find().sort({ order: 1 });
  res.json(templates);
});

app.post("/templates", async (req, res) => {
  const template = new Template(req.body);
  await template.save();
  res.json({ message: "Created" });
});

app.put("/templates/:id", async (req, res) => {
  await Template.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Template updated" });
});

// Contacts
app.get("/contacts", async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
});

// Upload
const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const filePath = req.file.path;
  const fileExt = req.file.originalname.split(".").pop().toLowerCase();
  let results = [];

  try {
    if (fileExt === "csv") {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath).pipe(csv())
          .on("data", (data) => data.email && results.push({ name: data.name, email: data.email }))
          .on("end", resolve).on("error", reject);
      });
    } else {
      const workbook = XLSX.readFile(filePath);
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      
      console.log("Raw Data First Row:", data.length > 0 ? JSON.stringify(data[0]) : "Empty");
      results = data.map(r => {
        const emailKey = Object.keys(r).find(k => k.toLowerCase() === "email");
        const nameKey = Object.keys(r).find(k => k.toLowerCase() === "name");
        return {
          name: nameKey ? r[nameKey] : "Unknown",
          email: emailKey ? r[emailKey] : null
        };
      }).filter(r => r.email);
      console.log(`Filtered Results: ${results.length}`);
    }

    console.log(`Processing ${results.length} contacts...`);
    for (let c of results) {
      if (c.email) {
        await Contact.updateOne({ email: c.email }, { $setOnInsert: { ...c, stage: "new" } }, { upsert: true });
      }
    }
    fs.unlinkSync(filePath);
    console.log(`Upload complete. Total: ${results.length}`);
    res.json({ message: "Uploaded", count: results.length });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Fail" });
  }
});

// Campaign Logic Extracted for reuse
async function runOutreach() {
  console.log("Outreach sequence triggered");
  const welcomeTemplate = await Template.findOne({ order: 0 });
  if (!welcomeTemplate) {
    throw new Error("Welcome template (order 0) not found in DB!");
  }

  const contacts = await Contact.find({ stage: "new" });
  console.log(`Found ${contacts.length} contacts in 'new' stage`);

  let sent = 0;
  for (let contact of contacts) {
    try {
      console.log(`[OUTREACH] Processing: ${contact.email} (${contact.name})`);
      const html = fillTemplate(welcomeTemplate.htmlBody, { name: contact.name });
      
      console.log(`[OUTREACH] Sending mail...`);
      const info = await transporter.sendMail({
        from: `Digital Vibe Solutions <${process.env.GMAIL_USER}>`,
        to: contact.email,
        subject: welcomeTemplate.subject,
        html: html
      });
      console.log(`[OUTREACH] Success! MessageID: ${info.messageId}`);
      
      contact.stage = "contacted";
      contact.lastSentAt = new Date();
      contact.nextFollowUpAt = new Date(Date.now() + (welcomeTemplate.delayDays || 0) * 24 * 60 * 60 * 1000);
      await contact.save();
      console.log(`[OUTREACH] Database updated for ${contact.email}`);

      await EmailLog.create({
        contactId: contact._id,
        templateId: welcomeTemplate._id,
        sentAt: new Date(),
        status: "sent"
      });

      sent++;
    } catch (sendErr) {
      console.error(`Failed to send to ${contact.email}:`, sendErr.message);
      await EmailLog.create({
        contactId: contact._id,
        templateId: welcomeTemplate._id,
        sentAt: new Date(),
        status: "failed",
        error: sendErr.message
      });
    }
  }
  return sent;
}

// Campaign Controls
app.post("/launch", async (req, res) => {
  try {
    const contactsCount = await Contact.countDocuments({ stage: "new" });
    if (contactsCount === 0) {
      return res.status(400).json({ error: "No new contacts to email. Please upload a file first." });
    }
    
    // Trigger in background to avoid timeout
    runOutreach().then(sent => {
      console.log(`Background outreach finished. Sent: ${sent}`);
    }).catch(err => {
      console.error("Background outreach error:", err);
    });

    res.json({ message: "Campaign started in background.", count: contactsCount });
  } catch (err) {
    console.error("Launch Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/run-automation", async (req, res) => {
  try {
    console.log("Triggering full automation run...");
    const outreachSent = await runOutreach();
    await runScheduler(); // Run follow-up logic immediately
    res.json({ 
      message: "Automation run complete", 
      outreachCount: outreachSent 
    });
  } catch (err) {
    console.error("Automation Run Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/mark-replied/:email", async (req, res) => {
  await Contact.updateOne({ email: req.params.email }, { 
    replied: true, 
    repliedAt: new Date(),
    nextFollowUpAt: new Date() // Trigger immediate next action on next cron tick
  });
  res.json({ message: "Marked replied" });
});

app.post("/opt-out/:email", async (req, res) => {
  await Contact.updateOne({ email: req.params.email }, { optedOut: true });
  res.json({ message: "Opted out" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
