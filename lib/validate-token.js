const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Set up the JWKS client
const client = jwksClient({
    jwksUri: 'https://www.googleapis.com/oauth2/v3/certs', // Google's JWKS URI
});

// Get the signing key
function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        } else {
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        }
    });
}

function validateToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}

module.exports = validateToken;
