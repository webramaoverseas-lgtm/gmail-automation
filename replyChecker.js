const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");
const Contact = require("./models/Contact");
const { runScheduler } = require("./scheduler");

const config = {
  imap: {
    user: process.env.GMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 10000,
    tlsOptions: { rejectUnauthorized: false }
  }
};

async function checkReplies() {
  console.log("--- Checking for new replies ---");
  let connection;
  try {
    connection = await imaps.connect(config);
    await connection.openBox("INBOX");

    // Search for unseen messages in the last 24 hours to keep it efficient
    const delay = 24 * 3600 * 1000;
    const yesterday = new Date(Date.now() - delay).toISOString();
    const searchCriteria = ["UNSEEN", ["SINCE", yesterday]];
    const fetchOptions = { bodies: [""], struct: true };

    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`Found ${messages.length} unread messages.`);

    for (const message of messages) {
      const all = message.parts.find(part => part.which === "");
      const id = message.attributes.uid;
      const parsed = await simpleParser(all.body);
      const fromEmail = parsed.from.value[0].address.toLowerCase();

      const contact = await Contact.findOne({ email: fromEmail });
      if (contact) {
        console.log(`Match found! Reply from: ${fromEmail}`);
        
        const snippet = parsed.text.substring(0, 200);
        
        // Update contact
        contact.replied = true;
        contact.repliedAt = new Date();
        contact.lastReplySnippet = snippet;
        contact.replyHistory.push({
          body: parsed.text,
          date: new Date()
        });

        // The user's logic: "If contact replies at ANY stage -> they jump to Converted"
        // Wait, the user also said "reply then conversion email". Let's refine:
        // If they reply to Welcome -> Conversion
        // If they reply to Re-engagement -> Conversion
        // If they reply to Conversion -> Converted
        // This is handled in scheduler.js logic.
        
        // Immediate Trigger: Set nextFollowUpAt to now
        contact.nextFollowUpAt = new Date();
        await contact.save();

        // Trigger scheduler for this contact immediately
        await runScheduler(contact._id.toString());

        // Mark as seen so we don't process it again
        await connection.addFlags(id, "\Seen");
      }
    }
  } catch (err) {
    console.error("IMAP Error:", err.message);
  } finally {
    if (connection) connection.end();
  }
}

// Poll every 1 minute (Fast for testing)
function startReplyChecker() {
    setInterval(checkReplies, 1 * 60 * 1000);
    // Initial check
    checkReplies();
}

module.exports = { startReplyChecker };
