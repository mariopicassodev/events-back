const express = require('express');
const Joi = require('joi');
const handlePrismaError = require('../lib/prisma-error-handling');

const schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required()
});

const createSignInRoute = (prisma, rollbar) => {
    const router = express.Router();

    router.post('/', async (req, res) => {

        const { error } = schema.validate(req.body);


        if (error) {
            // Handle validation error
            res.status(400).json({ error: 'Email or name is missing' });
            return;
        }

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

            res.status(200).json({ message: 'Sign in successful', user_id: user.id });
        } catch (error) {
            rollbar.error('Error during sign in:', error);
            const { status, message } = handlePrismaError(error);
            res.status(status).json({ error: message });
        }
    });

    return router;
};

module.exports = createSignInRoute;
