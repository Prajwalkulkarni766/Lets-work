const notificationMessages = {
    welcome: {
        title: "Welcome to Our Community!",
        content: "Hello ${user}, Welcome to Lets-Work! We're thrilled to have you as a part of our community. Explore and enjoy our platform's features. If you have any questions or need assistance, feel free to reach out. Happy exploring! Best regards, The Lets-Work Team",
    },
    friendRequestAccepted: {
        title: "Friend Request Accepted!",
        content: "Hello ${user}, Great news! Your friend request has been accepted by ${friendName}. You are now connected on Lets-Work. Feel free to start chatting, sharing updates, and enjoying the connection! If you have any questions or need assistance, don't hesitate to reach out. Best regards, The Lets-Work Team",
    },
    friendRequestRejected: {
        title: "Friend Request Rejected",
        content: "Hello ${user}, We regret to inform you that your friend request has been rejected by ${friendName}. If you have any questions or concerns, feel free to reach out. Thank you for using Lets-Work. Best regards, The Lets-Work Team",
    },
    post: {
        title: "${friendName} Posted Something New!",
        content: "Hello ${user}! Your friend ${friendName} just posted something new on Lets-Work. Check it out and engage with the post to share your thoughts. Stay connected and enjoy the updates! Best regards, The Lets-Work Team",
    },
    like: {
        title: "${friendName} Liked Your Post!",
        content: "Hello ${user}, Exciting news! Your friend ${friendName} just liked one of your posts on Lets-Work. It's always great to know your friends appreciate your content. Keep sharing and connecting on Lets-Work! Best regards, The Lets-Work Team",
    },
    jobApplicationShortlisted: {
        title: "Job Application Shortlisted!",
        content: "Hello ${applicantName}, Congratulations! Your job application for the position of ${jobPosition} has been shortlisted. We are impressed with your qualifications and would like to invite you for the next steps in the hiring process. Please be prepared for a possible interview or additional assessments. If you have any questions or need further information, feel free to reach out. Best of luck! Sincerely, The ${organizationName} Hiring Team",
    },
};

module.exports = notificationMessages;
