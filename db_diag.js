const mongoose = require("mongoose");
const fs = require("fs");
const log = (msg) => {
  console.log(msg);
  fs.appendFileSync("db_log.txt", msg + "\n");
};

const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.mdrrdu9.mongodb.net/gmailAutomation?retryWrites=true&w=majority";

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  htmlBody: { type: String, required: true },
  order: { type: Number, required: true },
  delayDays: { type: Number, default: 3 }
});

const Template = mongoose.model("Template", templateSchema);

async function diag() {
  fs.writeFileSync("db_log.txt", "Starting Diag...\n");
  try {
    log("Connecting...");
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    log("Connected!");

    log("Clearing...");
    const delRes = await Template.deleteMany({});
    log("Deleted: " + JSON.stringify(delRes));

    log("Inserting...");
    const insRes = await Template.create({
      name: "Diag Test",
      subject: "Test",
      htmlBody: "Test",
      order: 0
    });
    log("Inserted: " + insRes._id);

    log("Finding...");
    const all = await Template.find();
    log("Total Templates: " + all.length);
    log("Names: " + all.map(t => t.name).join(", "));

    process.exit(0);
  } catch (err) {
    log("ERROR: " + err.message);
    log("STACK: " + err.stack);
    process.exit(1);
  }
}

diag();
