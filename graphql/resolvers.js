const prisma = require('../lib/prisma-client');

const resolvers = {
    Query: {
        users: async () => {
            return await prisma.user.findMany();
        },
        user: async (parent, args) => {
            return await prisma.user.findUnique({ where: { id: args.id } });
        },
        upcomingEvents: async () => {
            return await prisma.event.findMany({
                where: {
                    schedule: {
                        gte: new Date(),
                    },
                },
            });
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
            return await prisma.event.create({
                data: {
                    name: args.name,
                    description: args.description,
                    location: args.location,
                    schedule: args.schedule,
                    fee: args.fee,
                    maxCapacity: args.maxCapacity,
                },
            });
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
