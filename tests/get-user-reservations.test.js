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


test('Get my reservations', async () => {
    // Create a user
    await prisma.user.create({
        data: {
            email: 'test5@test.com',
            name: 'test',
        },
    });
    const user = await prisma.user.findUnique({ where: { email: 'test5@test.com' } });
    const event = await prisma.event.create({
        data: {
            name: 'testname',
            description: 'testdesc',
            location: 'testloc',
            schedule: new Date('2025-03-24T21:04:00Z'),
            ownerId: user.id,
            fee: 10,
            maxCapacity: 100,
        },
    });

    const reservation = await prisma.reservation.create({
        data: {
            userId: user.id,
            eventId: event.id,
        },
    });

    console.log('reservation:', reservation);

    const token = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY);

    const query = `
        query {
            userReservations(userId: ${user.id}) {
                status
                id
            }
        }
    `;
    const response = await request(app)
        .post('/graphql')
        .send({ query })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

    console.log(response.body);
    expect(response.body.data.userReservations).toHaveLength(1);

    // Clean up database and close Prisma connection
    await prisma.reservation.deleteMany(); // Delete reservations first
    await prisma.event.deleteMany();       // Then delete events
    await prisma.user.deleteMany();        // Finally, delete users
});


