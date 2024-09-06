const { Prisma } = require('@prisma/client');
const handlePrismaError = require('./lib/prisma-error-handler');
const { GraphQLError } = require('graphql');

const withErrorHandling = (resolver) => {
    return async (parent, args, context, info) => {
        try {
            return await resolver(parent, args, context, info);
        } catch (error) {
            if (error instanceof GraphQLError) {
                throw error;
            }
            else if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            else {
                throw new GraphQLError('Internal server error', {
                    extensions: {
                        message: error.message,
                        code: 'INTERNAL_SERVER_ERROR',
                        http: {
                            status: 500,
                        }
                    }
                });
            }

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

            // get the event with reservations
            const event = await prisma.event.findUnique({
                where: { id: args.eventId },
                include: { reservations: true },
            });

            if (!event) {
                throw new GraphQLError('Event not found', {
                    extensions: {
                        code: 'NOT_FOUND',
                        http: {
                            status: 404,
                        }
                    }
                });
            }

            if (event?.reservations) {
                // check if the event is full of accepted reservations
                const acceptedReservations = event.reservations.filter(
                    (reservation) => reservation.status === 'ACCEPTED'
                );

                if (acceptedReservations.length >= event.maxCapacity) {
                    throw new GraphQLError('Event is full', {
                        extensions: {
                            code: 'CONFLICT',
                            http: {
                                status: 409,
                            }
                        }
                    });
                }

                // prevent duplication
                const existingReservation = event.reservations.find(
                    (reservation) => reservation.userId === args.userId
                );

                if (existingReservation) {
                    throw new GraphQLError('User already has a reservation', {
                        extensions: {
                            code: 'CONFLICT',
                            http: {
                                status: 409,
                            }
                        }
                    });
                }
            }

            // Perform optimistic concurrency control updating version
            // This is ACID
            // SEE: https://www.prisma.io/docs/orm/prisma-client/queries/transactions

            const [updatedEvent, reservation] = await prisma.$transaction([
                prisma.event.update({
                    where: { id: args.eventId, version: event.version },
                    data: {
                        version: {
                            increment: 1,
                        },
                    },
                }),
                prisma.reservation.create({
                    data: {
                        event: {
                            connect: { id: args.eventId },
                        },
                        user: {
                            connect: { id: args.userId },
                        },
                    },
                }),
            ]);

            return reservation;
        }),

        acceptReservation: withErrorHandling(async (parent, args, context) => {
            const { prisma } = context;

            // get the event with reservations
            const event = await prisma.event.findUnique({
                where: { id: args.eventId },
                include: { reservations: true },
            });

            if (!event) {
                throw new GraphQLError('Event not found', {
                    extensions: {
                        code: 'NOT_FOUND',
                        http: {
                            status: 404,
                        }
                    }
                });
            }

            if (event?.reservations) {
                // check if the event is full of accepted reservations
                const acceptedReservations = event.reservations.filter(
                    (reservation) => reservation.status === 'ACCEPTED'
                );

                if (acceptedReservations.length >= event.maxCapacity) {
                    throw new GraphQLError('Event is full', {
                        extensions: {
                            code: 'CONFLICT',
                            http: {
                                status: 409,
                            }
                        }
                    });
                }

                // must be a pending reservation
                const reservation = event.reservations.find(
                    (reservation) => reservation.id === args.reservationId
                );

                if (!reservation) {
                    throw new GraphQLError('Reservation not found', {
                        extensions: {
                            code: 'NOT_FOUND',
                            http: {
                                status: 404,
                            }
                        }
                    });
                }
                else if (reservation.status !== 'PENDING') {
                    throw new GraphQLError('Reservation is not pending', {
                        extensions: {
                            code: 'CONFLICT',
                            http: {
                                status: 409,
                            }
                        }
                    });
                }
            }

            // Perform optimistic concurrency control updating version
            // This is ACID
            // SEE: https://www.prisma.io/docs/orm/prisma-client/queries/transactions

            const [updatedEvent, reservation] = await prisma.$transaction([
                prisma.event.update({
                    where: { id: args.eventId, version: event.version },
                    data: {
                        version: {
                            increment: 1,
                        },
                    },
                }),
                prisma.reservation.update({
                    where: { id: args.reservationId },
                    data: {
                        status: 'ACCEPTED',
                    },
                }),
            ]);

            return reservation;

        }),

        rejectReservation: withErrorHandling(async (parent, args, context) => {
            const { prisma } = context;
            return await prisma.reservation.update({
                where: { id: args.reservationId },
                data: {
                    status: 'REJECTED',
                },
            });
        }),

        cancelReservation: withErrorHandling(async (parent, args, context) => {
            const { prisma } = context;

            await prisma.reservation.delete({
                where: { id: args.reservationId },
            });

            return true;
        }),
    },
};


module.exports = resolvers;
