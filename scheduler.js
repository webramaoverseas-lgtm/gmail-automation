const cron = require("node-cron");
const Contact = require("./models/Contact");
const Template = require("./models/Template");
const EmailLog = require("./models/EmailLog");
const nodemailer = require("nodemailer");
const { fillTemplate } = require("./templateEngine");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  family: 4,
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
});

async function runScheduler(specificContactId = null) {
  console.log("--- Running Scheduler Tick ---");
  const now = new Date();

  // Query contacts: either a specific one (immediate trigger) OR all due ones
  let query;
  if (specificContactId && (typeof specificContactId === 'string' || mongoose.Types.ObjectId.isValid(specificContactId))) {
    query = { _id: specificContactId };
  } else if (specificContactId && typeof specificContactId === 'object' && specificContactId._id) {
    query = { _id: specificContactId._id };
  } else {
    query = { nextFollowUpAt: { $lte: now }, optedOut: false, stage: { $nin: ["converted"] } };
  }

  const contacts = await Contact.find(query);

  console.log(`Processing ${contacts.length} contacts.`);

  for (const contact of contacts) {
    try {
      let nextTemplateName = "";
      let newStage = "";
      let nextStep = contact.sequenceStep;

      /**
       * User Logic:
       * 1. Welcome (contacted) 
       *    - Reply? -> Send Conversion, Stage: interested
       *    - No Reply? -> Send Re-engagement, Stage: re-engaged
       * 2. Re-engaged (re-engaged)
       *    - Reply? -> Send Conversion, Stage: interested
       *    - No Reply? -> Send Limited Time Offer, Stage: lto
       * 3. Conversion (interested)
       *    - Reply? -> Stage: converted (STOP)
       *    - No Reply? -> Send Limited Time Offer, Stage: lto
       * 4. Limited Time Offer (lto)
       *    - Reply? -> Stage: converted (STOP)
       *    - No Reply? -> (STOP)
       */

      if (contact.stage === "contacted") {
        if (contact.replied) {
          nextTemplateName = "Conversion";
          newStage = "interested";
          nextStep = 1; // Step 2 in UI
        } else {
          nextTemplateName = "Re-engagement";
          newStage = "re-engaged";
          nextStep = 1; // Step 2 in UI
        }
      } else if (contact.stage === "re-engaged") {
        if (contact.replied) {
          nextTemplateName = "Conversion";
          newStage = "interested";
          nextStep = 1; // Step 2
        } else {
          nextTemplateName = "Limited Time Offer";
          newStage = "lto";
          nextStep = 2; // Step 3
        }
      } else if (contact.stage === "interested") {
        if (contact.replied) {
          contact.stage = "converted";
          contact.sequenceStep = 3; // Success
          await contact.save();
          console.log(`Contact ${contact.email} is now CONVERTED!`);
          continue;
        } else {
          nextTemplateName = "Limited Time Offer";
          newStage = "lto";
          nextStep = 2; // Step 3
        }
      } else if (contact.stage === "lto") {
        if (contact.replied) {
          contact.stage = "converted";
          contact.sequenceStep = 3; // Success
          await contact.save();
          console.log(`Contact ${contact.email} is now CONVERTED!`);
        }
        continue;
      }

      if (!nextTemplateName) continue;

      const template = await Template.findOne({ name: nextTemplateName });
      if (!template) {
        console.error(`Template ${nextTemplateName} not found!`);
        continue;
      }

      // Send Email
      const html = fillTemplate(template.htmlBody, { name: contact.name });
      
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: contact.email,
        subject: template.subject,
        html: html
      });

      console.log(`Sent ${nextTemplateName} to ${contact.email}`);

      // Update Contact
      contact.stage = newStage;
      contact.sequenceStep = nextStep;
      contact.lastSentAt = now;
      contact.replied = false; // Reset for the next step check
      contact.nextFollowUpAt = new Date(now.getTime() + (template.delayDays || 3) * 24 * 60 * 60 * 1000);
      await contact.save();

      // Log
      await EmailLog.create({
        contactId: contact._id,
        templateId: template._id,
        status: "sent",
        sentAt: new Date()
      });

    } catch (err) {
      console.error(`Error processing contact ${contact.email}:`, err);
      await EmailLog.create({
        contactId: contact._id,
        status: "failed",
        error: err.message,
        sentAt: new Date()
      });
    }
  }
}

// Tick every hour
cron.schedule("0 * * * *", () => runScheduler());

module.exports = { runScheduler };
