const mongoose = require("mongoose");

// Testing the secondary connection string provided
const URIs = [
  { name: "New Connection String (Encoded)", uri: "mongodb+srv://textafricaarcade:123456789%21@text-africa.g0onfcd.mongodb.net/" },
  { name: "New Connection String (Raw)", uri: "mongodb+srv://textafricaarcade:123456789!@text-africa.g0onfcd.mongodb.net/" },
  { name: "Secondary - Raw Password", uri: "mongodb+srv://Secondary:123456789!@secondary.xdz6sji.mongodb.net/?appName=secondary" }
];

const test = async (uri, name) => {
  try {
    console.log(`\n--- Testing ${name} ---`);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ ${name} connected successfully!`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error(`❌ ${name} failed: ${err.message}`);
    return false;
  }
};

const run = async () => {
  for (const item of URIs) {
    if (await test(item.uri, item.name)) break;
  }
  process.exit(0);
};

run();
