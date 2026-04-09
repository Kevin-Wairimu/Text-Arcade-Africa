const mongoose = require("mongoose");

const uri = "mongodb+srv://Secondary:123456789%21@secondary.xdz6sji.mongodb.net/?retryWrites=true&w=majority";

console.log("Retrying connection to Secondary Cluster with encoded password...");
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log("✅ Successfully connected to MongoDB Atlas");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Failed to connect:", err.message);
    process.exit(1);
  });
