const mongoose = require("mongoose");

const uri = "mongodb+srv://textafricaarcade:123456789!@text-africa.g0onfcd.mongodb.net/";

console.log("Testing connection to TAA-DB Cluster...");

const run = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log("✅ Successfully connected to MongoDB Atlas (TAA-DB)");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ FAILED TO CONNECT:");
    console.error("Error Message:", err.message);
    process.exit(1);
  }
};

run();
