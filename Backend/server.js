const express = require("express");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");
const authRouter = require("./routes/auth");
const uploadRouter = require("./routes/upload");
const commentsRouter = require("./routes/comments");
const notificationRouter = require("./routes/notification");
const mongoose = require("mongoose");
require('dotenv').config();
const dbUrl = process.env.MONGODB_URL;
const path = require("path");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const cors = require("cors");

mongoose.connect(dbUrl)
    .then(() => {
        console.log('MongoDBコネクションOK');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー');
        console.log(err);
    });

const app = express();


const isProduction = process.env.NODE_ENV === "production";

app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: "/",
    maxAge: 1000 * 60 * 60 * 24, // 1日
    secure: isProduction, // HTTPSを使用しない開発環境ではfalse
    httpOnly: true, // JavaScriptからアクセス不可
    sameSite: isProduction ? "strict" :"lax", 
  },
  store: MongoStore.create({
    mongoUrl: dbUrl,
  })
}));

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000", // フロントエンドURL
    credentials: true, // クッキーを許可
  })
);

//POSTMANでExpress がリクエストの JSON ボディを解析し、req.body にアクセスできるようになるため
app.use(express.json());


app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use(express.static(path.join(__dirname, "build")));

app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/auth", authRouter);
app.use("/upload", uploadRouter);
app.use("/comments", commentsRouter);
app.use("/notification", notificationRouter);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use((err, req, res, next) => {
  const { message = "問題が起きました", status = 500 } = err;
  console.error(err);
  res.status(status).json({ message: message });
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log("ポート8000で起動中...");
});