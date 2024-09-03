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

// Create a reservation
test('Create a reservation', async () => {
    // Create a user
    await prisma.user.create({
        data: {
            email: 'test3@test.com',
            name: 'test',
        },
    });
    const user = await prisma.user.findUnique({ where: { email: 'test3@test.com' } });
    const event = await prisma.event.create({
        data: {
            name: 'testname',
            description: 'testdesc',
            location: 'testloc',
            schedule: new Date('2022-03-24T21:04:00Z'),
            ownerId: user.id,
            fee: 10,
            maxCapacity: 100,
        },
    });

    const token = jwt.sign({ user_id: user.id }, process.env.SECRET_KEY);

    const query = `
    mutation {
        createReservation(
            userId: ${user.id},
            eventId: ${event.id}
        )
        {
            id
            userId
            eventId
        }
    }
`;

    const response = await request(app)
        .post('/graphql')
        .send({ query })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    console.log(response.body);
    expect(response.body.data.createReservation).toMatchObject({
        userId: user.id,
        eventId: event.id,
    });

    // Clean up
    await prisma.reservation.deleteMany(); // Delete reservations first
    await prisma.event.deleteMany();       // Then delete events
    await prisma.user.deleteMany();        // Finally, delete users
});






