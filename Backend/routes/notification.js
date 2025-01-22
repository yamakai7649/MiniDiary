const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

//通知の取得
router.get("/", async (req, res, next) => {
    try {
        const { userId } = req.query;
        const notifications = await Notification.find({ userId: userId });
        return res.status(200).json(notifications);
    } catch (err) {
        return next(err);
    }
});

//通知の削除
router.delete("/", async (req, res, next) => {
    try {
        const { notificationId } = req.query;
        const deletedNotification = await Notification.findByIdAndDelete(notificationId);
        return res.status(200).json(deletedNotification);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;

