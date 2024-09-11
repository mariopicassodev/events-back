const os = require('os');

const CLIENT_PORT = 3000;

const config = {
    SERVER_PORT: process.env.PORT || 4000,
    CLIENT_PORT: CLIENT_PORT,
    CORS_ORIGIN: [
        `http://localhost:${CLIENT_PORT}`,
        'https://events-front-mu.vercel.app',
    ],
    MULTI_PROC: true,
    MAX_WORKERS: os.cpus().length,
}

module.exports = config;
