const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      default: "Text Africa Arcade",
    },
    defaultCategory: {
      type: String,
      default: "General",
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", SettingsSchema);
