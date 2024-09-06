const request = require('supertest');
const initApp = require('../express-server');
const prisma = require('../lib/prisma-client');
const jwt = require('jsonwebtoken');

let app;

beforeAll(async () => {
    app = await initApp(prisma);
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Sign in', () => {
    test('Sign in with valid email and name', async () => {

        await prisma.user.deleteMany(); // Delete users first

        // this is a common api request to /api/auth/signin
        const response = await request(app)
            .post('/api/auth/signin')
            .send({
                email: 'signintest@test.com',
                name: 'signintest'
            })
            .expect(200);

        expect(response.body).toMatchObject({
            message: 'Sign in successful',
            user_id: expect.any(Number)
        });

        await prisma.user.deleteMany();
    });

    test('Sign in with invalid email', async () => {

        await prisma.user.deleteMany(); // Delete users first

        const response = await request(app)
            .post('/api/auth/signin')
            .send({
                email: 'sadfdgh',
                name: 'signintest'
            })
            .expect(400);

        expect(response.body).toMatchObject({
            error: 'Email or name is missing'
        });

        await prisma.user.deleteMany();
    });

});
