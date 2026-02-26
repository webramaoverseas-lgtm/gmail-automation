const cron = require("node-cron");
const Contact = require("./models/Contact");
const Template = require("./models/Template");
const EmailLog = require("./models/EmailLog");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const { fillTemplate } = require("./templateEngine");

// No transporter needed for SendGrid API

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

  await Promise.all(contacts.map(async (contact) => {
    try {
      let nextTemplateName = "";
      let newStage = "";
      let nextStep = contact.sequenceStep;

      if (contact.stage === "contacted") {
        if (contact.replied) {
          nextTemplateName = "Conversion";
          newStage = "interested";
          nextStep = 1;
        } else {
          nextTemplateName = "Re-engagement";
          newStage = "re-engaged";
          nextStep = 1;
        }
      } else if (contact.stage === "re-engaged") {
        if (contact.replied) {
          nextTemplateName = "Conversion";
          newStage = "interested";
          nextStep = 1;
        } else {
          nextTemplateName = "Limited Time Offer";
          newStage = "lto";
          nextStep = 2;
        }
      } else if (contact.stage === "interested") {
        if (contact.replied) {
          contact.stage = "converted";
          contact.sequenceStep = 3;
          await contact.save();
          console.log(`Contact ${contact.email} is now CONVERTED!`);
          return;
        } else {
          nextTemplateName = "Limited Time Offer";
          newStage = "lto";
          nextStep = 2;
        }
      } else if (contact.stage === "lto") {
        if (contact.replied) {
          contact.stage = "converted";
          contact.sequenceStep = 3;
          await contact.save();
          console.log(`Contact ${contact.email} is now CONVERTED!`);
        }
        return;
      }

      if (!nextTemplateName) return;

      const template = await Template.findOne({ name: nextTemplateName });
      if (!template) {
        console.error(`Template ${nextTemplateName} not found!`);
        return;
      }

      const html = fillTemplate(template.htmlBody, { name: contact.name });
      console.log(`[SCHEDULER] Sending follow-up to ${contact.email} via SendGrid...`);
      await sgMail.send({
        from: `Digital Vibe Solutions <${process.env.GMAIL_USER}>`,
        to: contact.email,
        subject: template.subject,
        html: html
      });
      console.log(`[SCHEDULER] Success!`);

      contact.stage = newStage;
      contact.sequenceStep = nextStep;
      contact.lastSentAt = now;
      contact.replied = false;
      contact.nextFollowUpAt = new Date(now.getTime() + (template.delayDays || 3) * 24 * 60 * 60 * 1000);
      await contact.save();

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
  }));
}

// Tick every hour
cron.schedule("0 * * * *", () => runScheduler());

module.exports = { runScheduler };
