const request = require('supertest');
const initApp = require('../express-server');
const prisma = require('../lib/prisma-client');
const jwt = require('jsonwebtoken');


beforeAll(async () => {
    app = await initApp(prisma);
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Get event', () => {
    test('Get event', async () => {
        await prisma.reservation.deleteMany(); // Delete reservations first
        await prisma.event.deleteMany();       // Then delete events
        await prisma.user.deleteMany();        // Finally, delete users

        // Create a user
        const user = await prisma.user.create({
            data: {
                email: 'testgetevent@test.com',
                name: 'test',
            },
        });

        // Create a sample event
        const event = await prisma.event.create({
            data: {
                name: 'event1',
                description: 'event1 desc',
                location: 'event1 loc',
                schedule: new Date('2022-03-24T21:04:00Z'),
                ownerId: user.id,
                fee: 10,
                maxCapacity: 100,
            },
        });

        // Create a sample reservation
        const reservation = await prisma.reservation.create({
            data: {
                userId: user.id,
                eventId: event.id,
            },
        });

        const token = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY);

        const res = await request(app)
            .post('/graphql')
            .send({
                query: `
                    query {
                        event(id: ${event.id}) {
                            id
                            name
                            reservations {
                                id
                                user {
                                    id
                                    name
                                }
                            }
                        }
                    }
                `,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.event.id).toBe(event.id);
        expect(res.body.data.event.name).toBe(event.name);
        expect(res.body.data.event.reservations[0].id).toBe(reservation.id);
        expect(res.body.data.event.reservations[0].user.id).toBe(user.id);
        expect(res.body.data.event.reservations[0].user.name).toBe(user.name);

        await prisma.reservation.deleteMany(); // Delete reservations first
        await prisma.event.deleteMany();       // Then delete events
        await prisma.user.deleteMany();        // Finally, delete users
    });
});
