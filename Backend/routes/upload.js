const express = require("express");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "Mini-Diary-images", // Cloudinaryでの保存先フォルダ名
        allowed_formats: ["jpg", "png", "jpeg"], // 許可するファイル形式
    },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    const imageUrl = req.file.path;
    const publicId = req.file.filename;
    res.json({ imageUrl: imageUrl, public_id: publicId });
  } catch (err) {
    return next(err);
  }
});

router.delete("/delete", async (req, res, next) => {
  try {
    const { public_id } = req.query; // フロントから削除対象のpublic_idを受け取る

    if (!public_id) {
      return res.status(400).json({ error: "public_idが必要です" });
    }

    // Cloudinaryから画像を削除
    const result = await cloudinary.uploader.destroy(public_id);

    // 削除結果を確認してレスポンスを返す
    if (result.result === "ok") {
      return res.status(200).json({ message: "画像削除に成功しました" });
    } else {
      return res.status(500).json({ error: "画像削除に失敗しました", details: result });
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;