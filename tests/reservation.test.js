const request = require('supertest');
const initApp = require('../express-server');
const prisma = require('../lib/prisma-client');
const jwt = require('jsonwebtoken');


beforeAll(async () => {
    app = await initApp();

    // Create a user
    const user = await prisma.user.create({
        data: {
            email: 'test@test.com',
            name: 'test',
        },
    });
});


afterAll(async () => {
    // Clean up database and close Prisma connection
    await prisma.reservation.deleteMany(); // Delete reservations first
    await prisma.event.deleteMany();       // Then delete events
    await prisma.user.deleteMany();        // Finally, delete users
    await prisma.$disconnect();
});

// Create a reservation
test('Create a reservation', async () => {
    const user = await prisma.user.findUnique({ where: { email: 'test@test.com' } });
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
});




