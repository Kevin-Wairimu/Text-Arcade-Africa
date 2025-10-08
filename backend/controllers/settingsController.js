const Settings = require("../models/Settings");

// ✅ Get Settings (Create default if not found)
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ message: "Server error fetching settings" });
  }
};

// ✅ Update Settings
exports.updateSettings = async (req, res) => {
  try {
    const { siteTitle, defaultCategory, theme } = req.body;
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({ siteTitle, defaultCategory, theme });
    } else {
      settings.siteTitle = siteTitle || settings.siteTitle;
      settings.defaultCategory = defaultCategory || settings.defaultCategory;
      settings.theme = theme || settings.theme;
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ message: "Server error updating settings" });
  }
};
