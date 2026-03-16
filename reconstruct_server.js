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

const serverContent = fs.readFileSync(serverPath, "utf-8");

// Split the file into three parts:
// 1. Imports and setup (up to mailer require)
// 2. The SEED DATA and MongoDB Connection (to be replaced)
// 3. The ROUTES and server start

const routesMarker = "/* =========================\n   ROUTES";
const importsEndMarker = 'const { sendEmail } = require("./mailer");';

const importsEndIndex = serverContent.indexOf(importsEndMarker) + importsEndMarker.length;
const routesStartIndex = serverContent.indexOf(routesMarker);

if (importsEndIndex === -1 || routesStartIndex === -1) {
    // Try with \r\n
    const routesMarkerWindows = "/* =========================\r\n   ROUTES";
    const routesStartIndexWindows = serverContent.indexOf(routesMarkerWindows);
    
    if (routesStartIndexWindows === -1) {
        console.error("Markers not found.");
        process.exit(1);
    }
}

const finalRoutesStartIndex = serverContent.indexOf(routesMarker) !== -1 ? serverContent.indexOf(routesMarker) : serverContent.indexOf("/* =========================\r\n   ROUTES");

const part1 = serverContent.substring(0, importsEndIndex);
const part3 = serverContent.substring(finalRoutesStartIndex);

const middlePart = `

const app = express();
app.use(express.json());
app.use(cors());

/* =========================
   SEED DATA
========================= */
async function seedTemplates() {
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

if (!process.env.GMAIL_BRIDGE_URL) {
  console.error("CRITICAL: GMAIL_BRIDGE_URL environment variable is MISSING on Render!");
}
`;

fs.writeFileSync(serverPath, part1 + middlePart + part3);
console.log("✅ server.js successfully reconstructed.");
