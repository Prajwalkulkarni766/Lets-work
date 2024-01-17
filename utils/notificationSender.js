const Connection = require("../models/user/connection");
const Notification = require("../models/notification");
const notificationMessages = require("./notificationMessages");
const User = require("../models/user/user");
const Post = require("../models/user/post");
async function sendSignupNotification(userId, userName) {
    let messageContent = notificationMessages.welcome.content.replace("${user}", userName);
    const getNotification = await Notification({
        notificationTo: userId,
        notificationTitle: notificationMessages.welcome.title,
        notificationContent: messageContent,
        notificationReadStatus: false,
    });
    await getNotification.save();
}
async function sendPostNotifications(userId) {
    let messageTitle;
    let messageContent;
    const connections = await Connection.find({
        $or: [
            { user: userId },
            { connectionUserId: userId },
        ],
    });
    const userList = connections.map((connection) => {
        if (connection.user != userId) {
            return connection.user;
        }
        else if (connection.connectionUserId != userId) {
            return connection.connectionUserId;
        }
    });
    let userName = await User.findById(userId).select("name");
    userName = userName.name;
    userList.forEach(async (user) => {
        let friendName = await User.findById(user).select("name");
        friendName = friendName.name;
        messageTitle = notificationMessages.post.title.replace("${friendName}", userName);
        messageContent = notificationMessages.post.content.replace("${user}", friendName);
        messageContent = messageContent.replace("${friendName}", userName);
        const sendNotification = await Notification({
            notificationTo: user._id,
            notificationTitle: messageTitle,
            notificationContent: messageContent,
            notificationReadStatus: false,
        });
        await sendNotification.save();
    });
}
async function sendLikeNotification(userId, postId) {
    const whoLikedPost = await User.findById(userId);
    const whoLikedPostUserName = whoLikedPost.name;
    const whichPost = await Post.findById(postId);
    const whoPostedThePost = whichPost.user;
    let whoPostedThePostUserName = await User.findById(whoPostedThePost);
    whoPostedThePostUserName = whoPostedThePostUserName.name;
    messageTitle = notificationMessages.like.title.replace("${friendName}", whoLikedPostUserName);
    messageContent = notificationMessages.like.content.replace("${user}", whoPostedThePostUserName);
    messageContent = messageContent.replace("${friendName}", whoLikedPostUserName);
    const sendNotification = await Notification({
        notificationTo: whoPostedThePost,
        notificationTitle: messageTitle,
        notificationContent: messageContent,
        notificationReadStatus: false,
    });
    await sendNotification.save();
}
//send notification on connection request acceptance
async function sendConnectionRequestAcceptance(connection) {
    let whoMadeRequestUserName = await User.findById(connection.user.toString());
    whoMadeRequestUserName = whoMadeRequestUserName.name;
    let forWhomMadeRequestUserName = await User.findById(connection.connectionUserId.toString());
    forWhomMadeRequestUserName = forWhomMadeRequestUserName.name;
    messageContent = notificationMessages.friendRequestAccepted.content.replace("${user}", whoMadeRequestUserName);
    messageContent = messageContent.replace("${friendName}", forWhomMadeRequestUserName);
    const sendNotification = await Notification({
        notificationTo: connection.user,
        notificationTitle: notificationMessages.friendRequestAccepted.title,
        notificationContent: messageContent,
        notificationReadStatus: false,
    });
    await sendNotification.save();
}
async function sendConnectionRequestReject(connection) {
    let whoMadeRequestUserName = await User.findById(connection.user.toString());
    whoMadeRequestUserName = whoMadeRequestUserName.name;
    let forWhomMadeRequestUserName = await User.findById(connection.connectionUserId.toString());
    forWhomMadeRequestUserName = forWhomMadeRequestUserName.name;
    messageContent = notificationMessages.friendRequestRejected.content.replace("${user}", whoMadeRequestUserName);
    messageContent = messageContent.replace("${friendName}", forWhomMadeRequestUserName);
    const sendNotification = await Notification({
        notificationTo: connection.user,
        notificationTitle: notificationMessages.friendRequestRejected.title,
        notificationContent: messageContent,
        notificationReadStatus: false,
    });
    await sendNotification.save();
}
async function sendJobApplicationSortlistedNotification(userId, jobAdvertisement) {
    let jobApplicatantUserName = await User.findById(userId);
    jobApplicatantUserName = jobApplicatantUserName.name;
    messageContent = notificationMessages.jobApplicationShortlisted.content.replace("${applicantName}", jobApplicatantUserName);
    messageContent = messageContent.replace("${organizationName}", jobAdvertisement.organizationName);
    messageContent = messageContent.replace("${jobPosition}", jobAdvertisement.title);
    const sendNotification = await Notification({
        notificationTo: userId,
        notificationTitle: notificationMessages.jobApplicationShortlisted.title,
        notificationContent: messageContent,
        notificationReadStatus: false,
    });
    await sendNotification.save();
}
module.exports = {
    sendSignupNotification,
    sendPostNotifications,
    sendLikeNotification,
    sendConnectionRequestAcceptance,
    sendConnectionRequestReject,
    sendJobApplicationSortlistedNotification,
};