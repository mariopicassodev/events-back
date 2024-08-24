const express = require('express');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const validateToken = require('../lib/validate-token');
const prisma = require('../lib/prisma-client');

const createSignInRoute = (prisma) => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        console.log('Sign in request bodyyyyy:', req.body);
        // Extract from header bearer token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Bearer token missing' });
        }

        try {
            let decoded;
            try {
                decoded = await validateToken(token);
                console.log('Token is valid:', decoded);
            }
            catch (error) {
                console.error('Error validating token:', error);
                return res.status(401).json({ error: 'Invalid token' });
            }

            // Store with prisma the user and email in the database if it doesn't exist
            /*
            const user = await prisma.user.findUnique({ where: { email: decoded.email } });
            if (!user) {
                await prisma.user.create({
                    data: {
                        email: decoded.email,
                        name: decoded.name,
                    },
                });
            }
            */
            console.log('User signed in:', req.body.email);
            console.log('User signed in:', req.body.name);

            res.status(200).json({ message: 'Sign in successful' });
        } catch (error) {
            console.error('Error during sign in:', error);
            res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    });

    return router;
};

module.exports = createSignInRoute;
