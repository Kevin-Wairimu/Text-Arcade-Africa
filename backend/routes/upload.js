// routes/upload.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const supabase = require("../config/supabase");

// Use memory storage so we can upload directly to Supabase
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`;
    const isVideo = req.file.mimetype.startsWith("video/");
    
    // 1. Upload to Supabase Bucket 'uploads'
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      throw error;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    res.json({ 
      url: publicUrl,
      type: isVideo ? "video" : "image"
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(400).json({ message: err.message || "Failed to upload file" });
  }
});

module.exports = router;
