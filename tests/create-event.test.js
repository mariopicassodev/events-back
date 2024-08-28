// test create event endpoint

const request = require('supertest');
const  initApp  = require('../express-server');
const prisma = require('../lib/prisma-client');
const jwt = require('jsonwebtoken');

let app;

beforeAll(async () => {
    app = await initApp();

    // Create a user
    await prisma.user.create({
        data: {
            email: 'test@test.com',
            name: 'test',
        },
    });

});

afterAll(async () => {
    // Clean up database and close Prisma connection
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
});

describe('Create event', () => {
    test('Create event with valid token', async () => {
        const user = await prisma.user.findUnique({ where: { email: 'test@test.com' } });
        const token = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY);
        const query = `
        mutation {
            createEvent(
                name: "testname",
                description: "testdesc",
                location: "testloc",
                schedule: "5446-03-24T21:04:00Z",
                ownerId: ${user.id},
                fee: 10,
                maxCapacity: 100
            )
            {
                id
                name
                description
                location
                schedule
                ownerId
                fee
                maxCapacity
            }
        }
    `;
        // make the graphql request
        const response = await request(app)
            .post('/graphql')
            .send({
                query,
            })
            .set('Authorization', `Bearer ${token}`);
        // check if the response is correct
        expect(response.body.data.createEvent).toEqual({
            id: expect.any(Number),
            name: 'testname',
            description: 'testdesc',
            location: 'testloc',
            schedule: '5446-03-24T21:04:00.000Z',
            ownerId: user.id,
            fee: 10,
            maxCapacity: 100,
        });
    }
    );


    test('Create event with invalid token', async () => {
        const query = `
        mutation {
            createEvent(
                name: "testname",
                description: "testdesc",
                location: "testloc",
                schedule: "5446-03-24T21:04:00Z",
                ownerId: 1,
                fee: 10,
                maxCapacity: 100
            )
            {
                id
                name
                description
                location
                schedule
                ownerId
                fee
                maxCapacity
            }
        }
    `;
        // make the graphql request
        const response = await request(app)
            .post('/graphql')
            .send({
                query,
            })
            .set('Authorization', `Bearer invalidtoken`);
        // check if the response is correct

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Invalid token');
    }
    );

    test('Create event with missing fields', async () => {
        const user = await prisma.user.findUnique({ where: { email: 'test@test.com' } });
        const token = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY);
        const query = `
        mutation {
            createEvent(
                name: "testname",
                description: "testdesc",
                location: "testloc",
                schedule: "5446-03-24T21:04:00Z",
                ownerId: ${user.id},
                fee: 10
            )
            {
                id
                name
                description
                location
                schedule
                ownerId
                fee
                maxCapacity
            }
        }
    `;
        // make the graphql request
        const response = await request(app)
            .post('/graphql')
            .send({
                query,
            })
            .set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(400);
    });
});


