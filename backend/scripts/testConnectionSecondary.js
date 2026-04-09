const mongoose = require("mongoose");

// We'll use the URL-encoded password since "!" is a reserved character in connection URIs.
const uri = "mongodb+srv://Secondary:123456789%21@secondary.xdz6sji.mongodb.net/?appName=secondary";

console.log("Connecting to Secondary Cluster...");
console.log("URI (masked):", uri.replace(/:([^:@]+)@/, ":****@"));

const connect = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000 // 30 second timeout
    });
    console.log("✅ SUCCESS! Connected to the Secondary Cluster.");
    console.log("📡 Host:", mongoose.connection.host);
    console.log("🗃️  Database:", mongoose.connection.name);
    
    // Listing collections to verify read permissions
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📋 Collections found:", collections.map(c => c.name).join(", ") || "None (Empty DB)");

    await mongoose.disconnect();
    console.log("Disconnected successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ FAILED:", err.message);
    if (err.message.includes("IP address is not whitelisted")) {
        console.log("\n⚠️  Double-check your Atlas dashboard to ensure 0.0.0.0/0 is 'Active' and 'Confirmed'.");
    }
    process.exit(1);
  }
};

connect();
