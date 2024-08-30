const prisma = require('../lib/prisma-client');
const { GraphQLError } = require('graphql');

const resolvers = {
    Query: {
        users: async () => {
            return await prisma.user.findMany();
        },
        user: async (parent, args) => {
            return await prisma.user.findUnique({ where: { id: args.id } });
        },
        userEvents: async (parent, args) => {
            return await prisma.event.findMany({ where: { ownerId: args.userId } });
        },
        upcomingEvents: async () => {
            const events = await prisma.event.findMany({
                where: {
                    schedule: {
                        gte: new Date(),
                    },
                },
            });
            return events;
        },
        event: async (parent, args) => {
            return await prisma.event.findUnique({ where: { id: args.id } });
        },
        applications: async () => {
            return await prisma.application.findMany();
        },
        application: async (parent, args) => {
            return await prisma.application.findUnique({ where: { id: args.id } });
        },
    },
    Mutation: {
        createEvent: async (parent, args) => {


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
        createApplication: async (parent, args) => {
            return await prisma.application.create({
                data: {
                    eventId: args.eventId,
                    userId: args.userId,
                },
            });
        },
        acceptApplication: async (parent, args) => {
            return await prisma.application.update({
                where: { id: args.id },
                data: {
                    status: 'ACCEPTED',
                },
            });
        },
        rejectApplication: async (parent, args) => {
            return await prisma.application.update({
                where: { id: args.id },
                data: {
                    status: 'REJECTED',
                },
            });
        },
    },
};


module.exports = resolvers;
