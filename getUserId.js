const jwt = require('jsonwebtoken');
const secreteKey = process.env.JWT_SECRET_KEY;

const getUserId = async (token) => {
    const data = jwt.verify(token, secreteKey);
    return data.userId;
}

module.exports = getUserId;