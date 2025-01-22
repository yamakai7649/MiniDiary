const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');  // ファイルを保存するディレクトリ
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);  // ファイル名を現在のタイムスタンプ + 拡張子にする
  }
});

const upload = multer({ storage: storage });

router.post("/", upload.single("file"), async(req, res, next) => {
    try {
        return res.status(200).json("画像をアップロードしました！")
    } catch (err) {
      return next(err);
    }
});

router.delete("/delete", (req, res, next) => {
  const { fileName } = req.query;

  const filePath = path.join(__dirname, "../public/images", fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      return next(err);
    }
    return res.status(200).json("ファイル削除に成功しました");
  })
});

module.exports = router;