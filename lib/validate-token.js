const jwt = require('jsonwebtoken');

function validateToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
}

module.exports = validateToken;
