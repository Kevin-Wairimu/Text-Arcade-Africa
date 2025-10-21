const Settings = require("../models/Settings");

exports.getSettings = async (req, res) => {
  try {
    console.log("📥 Fetching settings...");
    const settings = await Settings.findOne().lean();
    if (!settings) {
      console.log("✅ No settings found, returning defaults");
      return res.status(200).json({
        siteTitle: "Text Africa Arcade",
        defaultCategory: "General",
        theme: "light",
      });
    }
    console.log("✅ Settings found:", settings);
    res.status(200).json(settings);
  } catch (err) {
    console.error("❌ Error fetching settings:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch settings", details: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    console.log("📥 Updating settings by user:", req.user?.email || "unknown", req.body);
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        siteTitle: req.body.siteTitle || "Text Africa Arcade",
        defaultCategory: req.body.defaultCategory || "General",
        theme: req.body.theme || "light",
      },
      { new: true, upsert: true }
    ).lean();
    console.log("✅ Settings updated:", settings);
    res.status(200).json(settings);
  } catch (err) {
    console.error("❌ Error updating settings:", err.message, err.stack);
    res.status(500).json({ error: "Failed to update settings", details: err.message });
  }
};