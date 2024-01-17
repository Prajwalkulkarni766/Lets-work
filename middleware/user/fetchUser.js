const jwt = require('jsonwebtoken');
const secreteKey = process.env.JWT_SECRET_KEY;
const fetchUser = (req, res, next) => {
    const token = req.header('token');
    if (!token) {
        return res.send(401).json({ error: 'Please provide vaild token' });
    }
    try {
        const data = jwt.verify(token, secreteKey);
        next();
    } catch (error) {
        console.log(error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
}
module.exports = fetchUser;
