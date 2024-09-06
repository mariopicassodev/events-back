const handlePrismaError = require('./lib/prisma-error-handler');

const withErrorHandling = (resolver) => {
    return async (parent, args, context, info) => {
        try {
            return await resolver(parent, args, context, info);
        } catch (error) {
            throw handlePrismaError(error);
        }
    };
};

const resolvers = {
    Query: {

        userEvents: withErrorHandling(async (parent, args, context) => {
            const { prisma } = context;
            console.log('Finding user with id:', args.userId);
            const userEvents = await prisma.event.findMany({
                where: { ownerId: args.userId },
                include: { reservations: true },
            });

            return userEvents;
        }),

        upcomingEvents: withErrorHandling(async (_, __, context) => {
            const { prisma } = context;
            const events = await prisma.event.findMany({
                where: {
                    schedule: {
                        gte: new Date(),
                    },
                },
            });
            return events;
        }),
        event: withErrorHandling(async (parent, args, context) => {
            const { prisma } = context;
            const event = await prisma.event.findUnique({
                where: { id: args.id },
                include: { reservations: { include: { user: true } } },
            });

            return event;
        }),
        userReservations: withErrorHandling(async (parent, args, context) => {
            const { prisma } = context;

            const userWithReservations = await prisma.user.findUnique({
                where: { id: args.userId },
                include: {
                    reservations: {
                        include: { event: true },
                    }
                },
            });

            console.log('User reservations:', userWithReservations.reservations);
            return userWithReservations.reservations;

        }),
    },
    Mutation: {
        createEvent: withErrorHandling(async (parent, args, context) => {

            const prisma = context.prisma;

            const event = await prisma.event.create({
                data: {
                    name: args.name,
                    description: args.description,
                    location: args.location,
                    schedule: args.schedule,
                    fee: args.fee,
                    maxCapacity: args.maxCapacity,
                    owner: {
                        connect: { id: args.ownerId } // Assuming ownerId is passed in args
                    }
                },
            });


            return event;

        }),
        createReservation: withErrorHandling(async (parent, args, context) => {
            const { prisma } = context;

            const reservation = await prisma.reservation.create({
                data: {
                    eventId: args.eventId,
                    userId: args.userId,
                },
            });

            return reservation;
        }),
        acceptReservation: withErrorHandling(async (parent, args, context) => {
            const { prisma } = context;
            return await prisma.reservation.update({
                where: { id: args.id },
                data: {
                    status: 'ACCEPTED',
                },
            });
        }),
        rejectReservation: withErrorHandling(async (parent, args, context) => {
            const { prisma } = context;
            return await prisma.reservation.update({
                where: { id: args.id },
                data: {
                    status: 'REJECTED',
                },
            });
        }),
    },
};


module.exports = resolvers;
