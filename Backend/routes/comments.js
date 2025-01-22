const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const CustomError = require("../customError");

//コメントを作成する
router.post("/:postId", async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        const comment = new Comment(req.body);
        await comment.save();
        await post.updateOne({
            $push: { comments: comment._id }
        });
        const user = await User.findById(comment.userId);
        const notification = new Notification({
            userId: post.userId,
            content: `${user.username}さんがあなたの日記にコメントをしました！`,
            type: "comment",
            postId: post._id
        });
        await notification.save();
        return res.status(200).json(comment);
    } catch (err) {
        return next(err);
    }
});

//コメントを削除する
router.delete("/:id", async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        const post = await Post.findOne({ comments: comment._id });
        if (comment.userId === req.query.userId) {
            const deletedComment = await comment.deleteOne();
            await post.updateOne({
                $pull: { comments: comment._id }
            });
            return res.status(200).json(deletedComment);
        } else {
            return next(new CustomError("投稿を削除する権限がありません", 403));
        }
    } catch (err) {
        return next(err);
    }
});

//特定のコメントを取得する
router.get("/:id", async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        return res.status(200).json(comment);
    } catch (err) {
        return next(err);
    }
});

//コメントにいいねをする
router.put("/:id/like", async (req, res, next) => {   
        try {
            const comment = await Comment.findById(req.params.id);
            if (!comment.likes.includes(req.body.userId)) {
                await comment.updateOne({
                    $push: { likes: req.body.userId }
                });
                return res.status(200).send("いいねをしました");
            } else {
                await comment.updateOne({
                    $pull: { likes: req.body.userId }
                });
                return res.status(200).send("いいねを外しました");
            }

        } catch (err) {
            return next(err);
        }    
});

//タイムラインのコメントを取得
router.get("/timeline/:postId", async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        const comments = await Promise.all(
            post.comments.map((commentId) => {
                return Comment.find({ _id: commentId });
            })
        );
        return res.status(200).json(comments);
    } catch (err) {
        return next(err);
    }
});

//プロフィールのタイムラインのコメントを取得
router.get("/profile/:username", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const userComments = await Comment.find({ userId: user._id });
        return res.status(200).json(userComments);
    } catch(err) {
        return next(err);
    }
});

module.exports = router;