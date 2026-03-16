const fs = require("fs");
const path = require("path");

const serverPath = path.join(__dirname, "server.js");
const html = fs.readFileSync("cleaned_welcome_template.html", "utf-8");
const personalizedHtml = html.replace(
    '<strong>Your Collection Looks Premium,</strong>',
    '<p>Hi {{name}},</p><p><strong>Your Collection Looks Premium,</strong></p>'
);

const escapedHtml = personalizedHtml.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const seedFunc = `async function seedTemplates() {
  // Clean up old templates to ensure the new order takes effect
  await Template.deleteOne({ name: "Welcome" });
  await Template.deleteOne({ name: "Premium Outreach" });
  
  const defaults = [
    { 
      name: "Welcome", 
      order: 0, 
      delayDays: 0, 
      subject: "Your Brand Looks Premium", 
      htmlBody: \`${escapedHtml}\`
    }
  ];

  for (const template of defaults) {
    await Template.findOneAndUpdate(
      { name: template.name },
      template,
      { upsert: true, new: true }
    );
  }
  console.log("Templates seeded/updated.");
}`;

let serverContent = fs.readFileSync(serverPath, "utf-8");

// Find the start and end of seedTemplates function
const startTag = "async function seedTemplates() {";
const endTag = "/* ========================="; // The start of ROUTES
const startIndex = serverContent.indexOf(startTag);
const endIndex = serverContent.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
    const before = serverContent.substring(0, startIndex);
    const after = serverContent.substring(endIndex);
    serverContent = before + seedFunc + "\n\n" + after;
    fs.writeFileSync(serverPath, serverContent);
    console.log("✅ server.js seedTemplates function restored and updated.");
} else {
    console.error("Could not find seedTemplates function or ROUTES marker.");
}
