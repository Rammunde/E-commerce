const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    PORTAL_NAME: process.env.PORTAL_NAME || "Shopveda",
    PORT: process.env.PORT || 5000
};
