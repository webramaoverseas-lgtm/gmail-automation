const fs = require("fs");
const path = require("path");

const serverPath = path.join(__dirname, "server.js");
const html = fs.readFileSync("cleaned_welcome_template.html", "utf-8");

// Fix personalization: wrap in <p> labels and add Hi {{name}}
const personalizedHtml = html.replace(
    '<strong>Your Collection Looks Premium,</strong>',
    '<p>Hi {{name}},</p><p><strong>Your Collection Looks Premium,</strong></p>'
);

// Escape backticks and ${ for template literal safety
const escapedHtml = personalizedHtml.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

let serverContent = fs.readFileSync(serverPath, "utf-8");

// Robustly find and remove ALL instances of seedTemplates function
// and the SEED DATA blocks
const seedTemplatesRegex = /async function seedTemplates\(\) \{[\s\S]*?console\.log\("Templates seeded\/updated\."\);\s*\}/g;
serverContent = serverContent.replace(seedTemplatesRegex, "");

// Remove redundant SEED DATA headers
serverContent = serverContent.replace(/\/\* =+[\s\S]*?SEED DATA[\s\S]*?=+\s*\*\//g, "");

// The target location for the clean seedTemplates function is before MongoDB Connection
const marker = "/* =========================\n   MongoDB Connection";
const insertIndex = serverContent.indexOf(marker);

const seedFunc = `
/* =========================
   SEED DATA
========================= */
async function seedTemplates() {
  // Clean up old templates
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
}
`;

if (insertIndex !== -1) {
    const before = serverContent.substring(0, insertIndex);
    const after = serverContent.substring(insertIndex);
    serverContent = before + seedFunc + "\n" + after;
    fs.writeFileSync(serverPath, serverContent);
    console.log("✅ server.js cleaned and seedTemplates function restored properly.");
} else {
    console.error("Could not find MongoDB Connection marker to insert seedTemplates.");
}
