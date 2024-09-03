const { GraphQLError } = require('graphql');
const prisma = require('../lib/prisma-client');

const resolvers = {
    Query: {
        users: async (_ ,__ ,context) => {
            const {prisma} = context;
            return await prisma.user.findMany();
        },
        user: async (parent, args, context) => {
            const {prisma} = context;
            return await prisma.user.findUnique({ where: { id: args.id } });
        },
        userEvents: async (parent, args, context) => {
            const {prisma} = context;
            const userEvents = await prisma.event.findMany({ where: { ownerId: args.userId } });
            if (!userEvents) {
                console.error('User not found');
                throw new GraphQLError('User not found', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        argumentName: 'id',
                        http: {
                            status: 400,
                        },
                    },
                });
            }
            return userEvents;
        },
        upcomingEvents: async ( _, __, context) => {
            const {prisma} = context;
            const events = await prisma.event.findMany({
                where: {
                    schedule: {
                        gte: new Date(),
                    },
                },
            });
            return events;
        },
        event: async (parent, args, context) => {
            const {prisma} = context;
            return await prisma.event.findUnique({ where: { id: args.id } });
        },
        userReservations: async (parent, args, context) => {
            const {prisma} = context;

            const userWithReservations = await prisma.user.findUnique({
                where: { id: args.userId },
                include: {
                    reservations: {
                        include: { event: true },
                    }
                },
            });

            if (!userWithReservations) {
                console.error('User not found');
                throw new GraphQLError('User not found', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        argumentName: 'id',
                        http: {
                            status: 400,
                        },
                    },
                });
            }

            console.log('User reservations:', userWithReservations.reservations);
            return userWithReservations.reservations;


        },
        reservation: async (parent, args) => {
            return await prisma.reservation.findUnique({ where: { id: args.id } });
        },
    },
    Mutation: {
        createEvent: async (parent, args, context) => {

            const prisma = context.prisma;

            console.log('Creating event. args:', args);

            // Log before finding the user
            console.log('Finding user with id:', args.ownerId);
            const user = await prisma.user.findUnique({
                where: { id: args.ownerId },
            });

            // Log after finding the user
            console.log('User found:', user);
            if (!user) {
                throw new GraphQLError('Invalid argument value', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        argumentName: 'id',
                        http: {
                            status: 400,
                        },
                    },
                });
            }

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

            if (!event) {
                throw new GraphQLError('Failed to create event', {
                    extensions: {
                        code: 'INTERNAL_SERVER_ERROR',
                        http: {
                            status: 500,
                        },
                    },
                });
            }

            return event;

        },
        createReservation: async (parent, args, context) => {
            const {prisma} = context;
            // Check if the user exists
            const user = await prisma.user.findUnique({
                where: { id: args.userId },
            });

            if (!user) {
                throw new GraphQLError('Invalid argument value', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        argumentName: 'id',
                        http: {
                            status: 400,
                        },
                    },
                });
            }

            // Check if the event exists

            const event = await prisma.event.findUnique({
                where: { id: args.eventId },
            });

            if (!event) {
                throw new GraphQLError('Invalid argument value', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        argumentName: 'id',
                        http: {
                            status: 400,
                        },
                    },
                });
            }

            const reservation = await prisma.reservation.create({
                data: {
                    eventId: args.eventId,
                    userId: args.userId,
                },
            });

            return reservation;
        },
        acceptReservation: async (parent, args, context) => {
            const {prisma} = context;
            return await prisma.reservation.update({
                where: { id: args.id },
                data: {
                    status: 'ACCEPTED',
                },
            });
        },
        rejectReservation: async (parent, args, context) => {
            const {prisma} = context;
            return await prisma.reservation.update({
                where: { id: args.id },
                data: {
                    status: 'REJECTED',
                },
            });
        },
    },
};


module.exports = resolvers;
