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
        
        const snippet = parsed.text.substring(0, 200).toLowerCase();
        
        // --- SENTIMENT ANALYSIS ---
        const negativeKeywords = ["not interested", "unsubscribe", "stop", "remove", "don't contact", "no thanks", "discard", "quit"];
        const isNegative = negativeKeywords.some(keyword => snippet.includes(keyword));

        if (isNegative) {
          console.log(`[SENTIMENT] Negative reply detected from ${fromEmail}. Redirecting to re-engagement or LTO.`);
          contact.sentiment = "negative";
        } else {
          console.log(`[SENTIMENT] Positive/Neutral reply from ${fromEmail}. Proceeding to conversion.`);
          contact.sentiment = "positive";
        }

        contact.replied = true;
        contact.repliedAt = new Date();
        contact.lastReplySnippet = parsed.text.substring(0, 200);
        contact.replyHistory.push({
          body: parsed.text,
          date: new Date()
        });

        // Set Next Follow-up timing based on logic:
        if (contact.sentiment === "negative" && contact.stage === "contacted") {
          // Negative reply to Welcome -> Send Re-engagement IMMEDIATELY
          contact.nextFollowUpAt = new Date();
        } else if (contact.sentiment === "negative" && contact.stage === "re-engaged") {
          // Negative reply to Re-engagement -> Send LTO after 2 DAYS
          contact.nextFollowUpAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        } else {
          // Positive reply OR No-Reply 2-day logic (handled in scheduler)
          contact.nextFollowUpAt = new Date(); // Trigger scheduler immediately to check and send next step
        }

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
