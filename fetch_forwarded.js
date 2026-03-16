require("dotenv").config();
const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");
const fs = require("fs");

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

async function fetchForwardedTemplate() {
  console.log("--- Searching for forwarded template ---");
  let connection;
  try {
    connection = await imaps.connect(config);
    await connection.openBox("INBOX");

    // Search for all messages from Kartikeya or containing "template"
    const searchCriteria = ["ALL"]; // We'll filter in JS
    const fetchOptions = { bodies: [""], struct: true };

    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`Analyzing ${messages.length} messages...`);

    // Sort messages by date descending
    messages.sort((a, b) => new Date(b.attributes.date) - new Date(a.attributes.date));

    for (const message of messages) {
      const all = message.parts.find(part => part.which === "");
      const parsed = await simpleParser(all.body);
      
      const subject = (parsed.subject || "").toLowerCase();
      const from = (parsed.from.text || "").toLowerCase();

      // Look for emails from Kartikeya or with "Fwd" in the subject
      if (from.includes("kartikeya") || subject.includes("fwd") || subject.includes("template")) {
        console.log(`\n--- Match Found ---`);
        console.log(`From: ${parsed.from.text}`);
        console.log(`Subject: ${parsed.subject}`);
        console.log(`Date: ${message.attributes.date}`);
        
        // Save the HTML body to a file for analysis
        const html = parsed.html || parsed.textAsHtml;
        if (html) {
          fs.writeFileSync("forwarded_template.html", html);
          console.log("✅ HTML template extracted to 'forwarded_template.html'");
          break; // Stop after the first most recent match
        }
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    if (connection) connection.end();
    process.exit();
  }
}

fetchForwardedTemplate();
