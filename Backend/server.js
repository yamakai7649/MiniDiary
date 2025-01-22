const express = require("express");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");
const authRouter = require("./routes/auth");
const uploadRouter = require("./routes/upload");
const commentsRouter = require("./routes/comments");
const notificationRouter = require("./routes/notification");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();
const dbUrl = process.env.MONGODB_URL;
const path = require("path");
const CustomError = require("./customError");
const session = require("express-session");
const MongoStore = require('connect-mongo');


mongoose.connect(dbUrl)
    .then(() => {
        console.log('MongoDBコネクションOK');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー');
        console.log(err);
    });

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: "/",
    maxAge: 1000 * 60 * 60 * 24, // 1日
    secure: false, // HTTPSを使用しない開発環境ではfalse
    httpOnly: true, // JavaScriptからアクセス不可
    sameSite: "lax", // CSRFを防ぎつつクロスサイト連携も可能
  },
  store: MongoStore.create({
    mongoUrl: dbUrl,
  })
}));

//POSTMANでExpress がリクエストの JSON ボディを解析し、req.body にアクセスできるようになるため
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // フロントエンドのオリジン
}));

app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/notification", notificationRouter);

app.all("*", (req, res, next) => {
  next(new CustomError("指定されたリソースが存在しないため、データを取得できませんでした。", 404));
});

app.use((err, req, res, next) => {
  const { message = "問題が起きました", status = 500 } = err;
  console.error(err);
  res.status(status).json({ message: message });
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log("ポート8000で起動中...");
});