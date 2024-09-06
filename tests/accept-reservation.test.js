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

describe('Accept reservation', () => {

    test('Accept a reservation', async () => {

        await prisma.reservation.deleteMany(); // Delete reservations first
        await prisma.event.deleteMany();       // Then delete events
        await prisma.user.deleteMany();        // Finally, delete users

        // Create a user
        await prisma.user.create({
            data: {
                email: 'acceptrestest@ŧest.com',
                name: 'acceptrestest',
            },
        });

        const user = await prisma.user.findUnique({ where: { email: 'acceptrestest@ŧest.com' } });

        const event = await prisma.event.create({
            data: {
                name: 'acceptrestest',
                description: 'acceptrestest',
                location: 'acceptrest',
                schedule: new Date('2022-03-24T21:04:00Z'),
                ownerId: user.id,
                fee: 10,
                maxCapacity: 100,
            },
        });

        const reservation = await prisma.reservation.create({
            data: {
                userId: user.id,
                eventId: event.id,
                status: 'PENDING',
            },
        });

        const token = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY);

        const query = `
            mutation {
                acceptReservation(
                    eventId: ${event.id},
                    reservationId: ${reservation.id}
                )
                {
                    id
                    status
                }
            }
            `;

        const response = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Authorization', `Bearer ${token}`);

        console.log(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.acceptReservation.status).toBe('ACCEPTED');

        await prisma.reservation.deleteMany(); // Delete reservations first
        await prisma.event.deleteMany();       // Then delete events
        await prisma.user.deleteMany();        // Finally, delete users
    });

    test('Accept a reservation with invalid reservation ID', async () => {

        await prisma.reservation.deleteMany(); // Delete reservations first
        await prisma.event.deleteMany();       // Then delete events
        await prisma.user.deleteMany();        // Finally, delete users

        // Create a user
        const user = await prisma.user.create({
            data: {
                email: 'acceptrestest@ŧest.com',
                name: 'acceptrestest',
            },
        });

        const token = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY);

        const query = `
            mutation {
                acceptReservation(
                    eventId: 32467823,
                    reservationId: 3135418
                )
                {
                    id
                    status
                }
            }
            `;

        const response = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);

        await prisma.reservation.deleteMany(); // Delete reservations first
        await prisma.event.deleteMany();       // Then delete events
        await prisma.user.deleteMany();        // Finally, delete users
    });

    test('Fail to accept a reservation with full capacity', async () => {

            await prisma.reservation.deleteMany(); // Delete reservations first
            await prisma.event.deleteMany();       // Then delete events
            await prisma.user.deleteMany();        // Finally, delete users

            // Create a user
            const user = await prisma.user.create({
                data: {
                    email: 'acceptrestest@ŧest.com',
                    name: 'acceptrestest',
                },
            });

            const user2 = await prisma.user.create({
                data: {
                    email: 'acceptrestest2@ŧest.com',
                    name: 'acceptrestest2',
                },
            });

            const user3 = await prisma.user.create({
                data: {
                    email: 'acceptrestest3@ŧest.com',
                    name: 'acceptrestest3',
                },
            });

            const event = await prisma.event.create({
                data: {
                    name: 'acceptrestest',
                    description: 'acceptrestest',
                    location: 'acceptrest',
                    schedule: new Date('2022-03-24T21:04:00Z'),
                    ownerId: user.id,
                    fee: 10,
                    maxCapacity: 2,
                },
            });

            const reservation = await prisma.reservation.create({
                data: {
                    userId: user.id,
                    eventId: event.id,
                    status: 'ACCEPTED',
                },
            });

            const reservation2 = await prisma.reservation.create({
                data: {
                    userId: user2.id,
                    eventId: event.id,
                    status: 'ACCEPTED',
                },
            });

            const reservation3 = await prisma.reservation.create({
                data: {
                    userId: user3.id,
                    eventId: event.id,
                    status: 'PENDING',
                },
            });



            const token = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY);

            const query = `
                mutation {
                    acceptReservation(
                        eventId: ${event.id},
                        reservationId: ${reservation3.id}
                    )
                    {
                        id
                        status
                    }
                }
                `;

            const response = await request(app)
                .post('/graphql')
                .send({ query })
                .set('Authorization', `Bearer ${token}`);

            console.log(response.body);

            expect(response.status).toBe(409);
            expect(response.body.errors[0].message).toBe('Event is full');

            await prisma.reservation.deleteMany(); // Delete reservations first
            await prisma.event.deleteMany();       // Then delete events
            await prisma.user.deleteMany();        // Finally, delete users
        });
});
