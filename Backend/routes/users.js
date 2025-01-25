const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Notification = require("../models/Notification");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

//おすすめのユーザーを取得
router.get("/recommendation", async (req, res, next) => {
    try {
        const username = req.query.username;
        const users = await User.aggregate([
            { $match: { username: { $ne: username } } },
            { $sample: { size: 10 } }
        ]);
        return res.status(200).json(users);
    } catch (err) {
        return next(err);
    }
});

//ユーザーの更新
router.put("/:id", async (req, res, next) => {
    try {
        //req.bodyに書かれた内容で全体を更新します
        //const user = await User.findByIdAndUpdate(req.params.id, req.body);
        //req.bodyの内容だけを特定のフィールドに設定して更新します
        const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body });
        return res.status(200).json(user);
    } catch (err) {
        return next(err);
    }
});

//ユーザーの削除
router.delete("/", async (req, res, next) => {
    try {
        const userId = req.query.userId;

        const posts = await Post.find({ userId: userId });
        const comments = await Comment.find({ userId: userId });
        const notifications = await Notification.find({ userId: userId });

        posts && await Promise.all(posts.map(async(post) => {
            await Promise.all(post.comments.map((commentId) => {
                return Comment.findByIdAndDelete(commentId);
            }))
        }));

        posts && await posts.deleteMany();
        comments && await comments.deleteMany();
        notifications && await notifications.deleteMany();

        const user = await User.findByIdAndDelete(userId);

        return res.status(200).json(user);
    } catch (err) {
        return next(err);
    }
});

//ユーザーをクエリで取得
router.get("/", async (req, res, next) => {
    try {
        const username = req.query.username;
        const userId = req.query.userId;
        const user = userId ?
        await User.findById(userId) :
        await User.findOne({ username: username });
        const { password, updatedAt, ...others } = user._doc;
        //user._docは、Mongooseのドキュメントオブジェクトの中に格納された生データを指します。
        //これを使うことで、Mongooseのメソッドや追加情報を省いた純粋なデータにアクセスできます。
        return res.status(200).json(others);
    } catch (err) {
        return next(err);
    }
});

//ユーザーのフォロー
router.put("/:username/follow", async (req, res, next) => {
    if (req.body.username === req.params.username) {
        return next(new CustomError("自分のことをフォローすることはできません",400))
    }

    try {
        const user = await User.findOne({ username: req.params.username });
        const currentUser = await User.findOne({ username: req.body.username });

        // フォロー済みかチェック
        if (currentUser.followings.includes(user.id)) {
            return next(new CustomError("そのユーザーはすでにフォロー済みです", 409));
        }

        // フォロー処理
        const updatedUser = await User.findByIdAndUpdate(currentUser.id, {
            $push: { followings: user.id }
        }, { new: true });
        await User.findByIdAndUpdate(user.id, {
            $push: { followers: currentUser.id }
        });


        // 通知の作成（ここで追加）
        const notification = new Notification({
            userId: user._id,
            type: "follow",
            content: `${currentUser.username}さんがあなたのことをフォローしました！`,
            usernameOfFollower: currentUser.username,
        });
        await notification.save();

        // 最終的なレスポンス
        return res.status(200).json(updatedUser);
    } catch (err) {
        return next(err);
    }
});

//ユーザーのフォローを外す
router.put("/:username/unfollow", async (req, res, next) => {
    if (req.body.username === req.params.username) {
        return next(new CustomError("自分のことをフォロー解除することはできません", 400));
    }

    try {
        const user = await User.findOne({ username: req.params.username });
        const currentUser = await User.findOne({ username: req.body.username });

        // フォロー済みかチェック
        if (!currentUser.followings.includes(user.id)) {
            return next(new CustomError("そのユーザーはまだフォローしていません", 409));
        }

        // アンフォロー処理
        const updatedUser = await User.findByIdAndUpdate(currentUser.id, {
            $pull: { followings: user.id }
        }, { new: true });
        await User.findByIdAndUpdate(user.id, {
            $pull: { followers: currentUser.id }
        });        

        // 最終的なレスポンス
        return res.status(200).json(updatedUser);
    } catch (err) {
        return next(err);
    }
});




module.exports = router;