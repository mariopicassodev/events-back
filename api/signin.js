const express = require('express');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const validateToken = require('../lib/validate-token');
const prisma = require('../lib/prisma-client');

const createSignInRoute = () => {
    const router = express.Router();

    router.post('/', async (req, res) => {


        try {
            // Store with prisma the user and email in the database if it doesn't exist
            let user = await prisma.user.findUnique({ where: { email: req.body.email } });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email: req.body.email,
                        name: req.body.name,
                    },
                });
            }

            console.log('User signed in:', req.body.email);
            console.log('User signed in:', req.body.name);

            res.status(200).json({ message: 'Sign in successful' , user_id: user.id});
        } catch (error) {
            console.error('Error during sign in:', error);
            res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    });

    return router;
};

module.exports = createSignInRoute;
