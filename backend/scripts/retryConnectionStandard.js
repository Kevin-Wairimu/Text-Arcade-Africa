const mongoose = require("mongoose");

const uri = "mongodb://Secondary:123456789%21@ac-fotkeoo-shard-00-00.xdz6sji.mongodb.net:27017,ac-fotkeoo-shard-00-01.xdz6sji.mongodb.net:27017,ac-fotkeoo-shard-00-02.xdz6sji.mongodb.net:27017/?ssl=true&replicaSet=atlas-wqf2x1-shard-0&authSource=admin&retryWrites=true&w=majority";

console.log("Retrying connection with Standard (non-SRV) URI...");

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
    console.error("Error Message:", err.message);
    process.exit(1);
  }
};

run();
