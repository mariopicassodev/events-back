// test create event endpoint

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

describe('Get upcoming events', () => {
    test('Get upcoming events', async () => {

        await prisma.reservation.deleteMany(); // Delete reservations first
        await prisma.event.deleteMany();       // Then delete events
        await prisma.user.deleteMany();        // Finally, delete users

        // Create a user
        const user = await prisma.user.create({
            data: {
                email: 'test4@test.com',
                name: 'test',
            },
        });
        // Create sample events
        await prisma.event.createMany({
            data: [
                {
                    name: 'event1',
                    description: 'event1 desc',
                    location: 'event1 loc',
                    schedule: new Date('2022-03-24T21:04:00Z'),
                    ownerId: user.id,
                    fee: 10,
                    maxCapacity: 100,
                },
                {
                    name: 'event2',
                    description: 'event2 desc',
                    location: 'event2 loc',
                    schedule: new Date('3000-03-24T21:04:00Z'),
                    ownerId: user.id,
                    fee: 10,
                    maxCapacity: 100,
                },
                {
                    name: 'event3',
                    description: 'event3 desc',
                    location: 'event3 loc',
                    schedule: new Date('2025-03-24T21:04:00Z'),
                    ownerId: user.id,
                    fee: 10,
                    maxCapacity: 100,
                },
            ],

        });
        const token = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY);
        const query = `
        query {
            upcomingEvents
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
            .set('Authorization', `Bearer ${token}`)
            .send({
                query,
            });
        console.log(response.body);
        expect(response.body.data.upcomingEvents.length).toBe(2);

        // Clean up
        await prisma.reservation.deleteMany(); // Delete reservations first
        await prisma.event.deleteMany();       // Then delete events
        await prisma.user.deleteMany();        // Finally, delete users
    }
    );
});

