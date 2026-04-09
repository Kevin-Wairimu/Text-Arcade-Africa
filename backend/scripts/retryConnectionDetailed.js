const mongoose = require("mongoose");

const uri = "mongodb+srv://Secondary:123456789!@secondary.xdz6sji.mongodb.net/?retryWrites=true&w=majority";

console.log("Retrying connection to Secondary Cluster with RAW password (!) ...");

const run = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log("✅ Successfully connected to MongoDB Atlas");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ FAILED TO CONNECT:");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    if (err.reason) {
      console.error("Error Reason:", JSON.stringify(err.reason, null, 2));
    }
    process.exit(1);
  }
};

run();
