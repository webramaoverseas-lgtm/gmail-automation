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

async function fetchLatestEmail() {
  let connection;
  try {
    connection = await imaps.connect(config);
    await connection.openBox("INBOX");

    const searchCriteria = ["ALL"]; // Get all to find the absolute latest
    const fetchOptions = { bodies: [""], struct: true };

    const messages = await connection.search(searchCriteria, fetchOptions);
    if (messages.length === 0) {
      console.log("No messages found.");
      return;
    }

    // Sort by UID to get the latest
    messages.sort((a, b) => b.attributes.uid - a.attributes.uid);
    const latestMessage = messages[0];
    
    const all = latestMessage.parts.find(part => part.which === "");
    const parsed = await simpleParser(all.body);

    console.log("Subject:", parsed.subject);
    console.log("From:", parsed.from.text);
    
    const htmlBody = parsed.html || parsed.textAsHtml || "No HTML content found";
    
    fs.writeFileSync("last_fetched_template.html", htmlBody);
    console.log("✅ HTML content saved to last_fetched_template.html");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    if (connection) connection.end();
  }
}

fetchLatestEmail();
