const cron = require("node-cron");
const Contact = require("./models/Contact");
const Template = require("./models/Template");
const EmailLog = require("./models/EmailLog");
// Native fetch for Gmail Bridge
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
  let query = { 
    nextFollowUpAt: { $lte: now }, 
    optedOut: false, 
    stage: { $nin: ["converted"] } 
  };

  if (specificContactId) {
    const id = (typeof specificContactId === 'object' && specificContactId._id) 
               ? specificContactId._id 
               : specificContactId;
    query._id = id;
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
          if (contact.sentiment === "positive") {
            nextTemplateName = "Conversion";
            newStage = "interested";
            nextStep = 1;
          } else {
            // Negative reply to Welcome -> Re-engagement (User said automatically)
            nextTemplateName = "Re-engagement";
            newStage = "re-engaged";
            nextStep = 1;
          }
        } else {
          // No reply to Welcome -> Re-engagement (after 2 days)
          nextTemplateName = "Re-engagement";
          newStage = "re-engaged";
          nextStep = 1;
        }
      } else if (contact.stage === "re-engaged") {
        if (contact.replied) {
          if (contact.sentiment === "positive") {
            nextTemplateName = "Conversion";
            newStage = "interested";
            nextStep = 2; // Jump to specialized step
          } else {
            // Negative reply to Re-engagement -> LTO after 2 days
            nextTemplateName = "Limited Time Offer";
            newStage = "lto";
            nextStep = 2;
          }
        } else {
          // No reply to Re-engagement -> LTO
          nextTemplateName = "Limited Time Offer";
          newStage = "lto";
          nextStep = 2;
        }
      } else if (contact.stage === "interested") {
        if (contact.replied && contact.sentiment === "positive") {
          contact.stage = "converted";
          contact.sequenceStep = 3;
          await contact.save();
          console.log(`Contact ${contact.email} is now CONVERTED!`);
          return;
        } else {
          // No reply or Negative reply to Conversion -> LTO
          nextTemplateName = "Limited Time Offer";
          newStage = "lto";
          nextStep = 2;
        }
      } else if (contact.stage === "lto") {
        if (contact.replied && contact.sentiment === "positive") {
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
      console.log(`[SCHEDULER] Sending follow-up to ${contact.email} via Gmail Bridge...`);
      
      const response = await fetch(process.env.GMAIL_BRIDGE_URL, {
        method: "POST",
        body: JSON.stringify({
          to: contact.email,
          subject: template.subject,
          body: html,
          isHtml: true
        })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      console.log(`[SCHEDULER] Success!`);

      contact.stage = newStage;
      contact.sequenceStep = nextStep;
      contact.lastSentAt = now;
      contact.replied = false;
      contact.sentiment = "neutral"; // Reset for next stage
      
      // User says "send mail after 2 days" consistently
      const delay = 2 * 24 * 60 * 60 * 1000;
      contact.nextFollowUpAt = new Date(now.getTime() + delay);
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
