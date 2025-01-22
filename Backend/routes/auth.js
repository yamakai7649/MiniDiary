const express = require("express");
const router = express.Router();
const User = require("../models/User");
const CustomError = require("../customError");
const { hashPassword,verifyPassword } = require("../hashPassword");

//ユーザー登録
router.post("/register", async (req, res, next) => {
    try {
        const { password,username } = req.body;
        const hashedPassword = await hashPassword(password);
        const newUser = new User({ username: username, password: hashedPassword });
        const user = await newUser.save();
        return res.status(200).json(user);
    } catch (err) {
        return next(err);
    }
});

//ログイン
router.post("/login", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        const isMatch = await verifyPassword(req.body.password, user.password);
        if (!isMatch) {
            return next(new CustomError("パスワードが違います", 400));
        }
        req.session.regenerate((err) => {
            if (err) return next(err);
            req.session.user = { id: user._id };
            req.session.save(() => {
                if (err) return next(err);
            });
            return res.status(200).json(user);
        });
    } catch (err) {
        return next(err);
    }
});

//ログアウト
router.post("/logout", async (req, res, next) => {
    try {
        req.session.destroy((err) => {
            if (err) return next(err);
            res.clearCookie("connect.sid",
                {
                    path: "/",
                    secure: false, // HTTPSを使用しない開発環境ではfalse
                    httpOnly: true, // JavaScriptからアクセス不可
                    sameSite: "lax", // CSRFを防ぎつつクロスサイト連携も可能
                }
            );
            return res.status(200).json({ message: "ログアウトしました" });
        });
    } catch (err) {
        return next(err);
    }
});

//ユーザーの検証
router.get("/", async (req, res) => {
    try {
        const { username } = req.query;
        const user = await User.find({ username: username });
        return res.status(200).json(user);
    } catch (err) {
        return next(err);
    }
});

//セッションからユーザーを取得
router.get("/user", async (req, res, next) => {
    try {
        if (!req.session.user) return null;
        const { id } = req.session.user;
        const user = await User.findById(id);
        return res.status(200).json(user);
    } catch (err) {
        return next(err);
    }
});


module.exports = router;