const jwt = require("jsonwebtoken");
const secreteKey = process.env.JWT_SECRET_KEY;
const getOrganizationId = async (token) => {
    const data = jwt.verify(token, secreteKey);
    return data.organizationId;
};
module.exports = getOrganizationId;
