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

describe('Reject reservation', () => {

    test('Reject a reservation', async () => {

        await prisma.reservation.deleteMany(); // Delete reservations first
        await prisma.event.deleteMany();       // Then delete events
        await prisma.user.deleteMany();        // Finally, delete users

        // Create a user
        await prisma.user.create({
            data: {
                email: 'rejectrestest@ŧest.com',
                name: 'rejectrestest',
            },
        });
        const user = await prisma.user.findUnique({ where: { email: 'rejectrestest@ŧest.com' } });
        const event = await prisma.event.create({
            data: {
                name: 'rejectrestest',
                description: 'rejectrestest',
                location: 'rejectrest',
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
                    rejectReservation(
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
        expect(response.body.data.rejectReservation).toMatchObject({
            id: reservation.id,
            status: 'REJECTED',
        });

        // Clean up
        await prisma.reservation.deleteMany(); // Delete reservations first
        await prisma.event.deleteMany();       // Then delete events
        await prisma.user.deleteMany();        // Finally, delete users
    });
});
