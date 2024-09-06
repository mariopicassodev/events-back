// Description: This file contains the type definitions for the GraphQL schema.
typeDefs = `#graphql
    type User {
        id: Int
        email: String
        name: String
        events: [Event]
        reservations: [Reservation]
        createdAt: DateTime
        updatedAt: DateTime
    }

    type Event {
        id: Int
        version: Int
        name: String
        description: String
        location: String
        schedule: DateTime
        fee: Int
        maxCapacity: Int
        ownerId: Int
        owner: User
        reservations: [Reservation]
        createdAt: DateTime
        updatedAt: DateTime
    }

    type Reservation {
        id: Int
        eventId: Int
        event: Event
        userId: Int
        user: User
        status: ReservationStatus
        createdAt: DateTime
        updatedAt: DateTime
    }

    enum ReservationStatus {
        PENDING
        ACCEPTED
        REJECTED
    }

    type Query {
        upcomingEvents: [Event]!
        event(id: Int!): Event!
        userEvents(userId: Int!): [Event]!
        userReservations(userId: Int!): [Reservation]!
    }

    type Mutation {

        createEvent(
            name: String!,
            description: String!,
            location: String,
            schedule: DateTime!,
            fee: Int!,
            maxCapacity: Int!,
            ownerId: Int!
        ): Event!
        createReservation(eventId: Int!, userId: Int!): Reservation!
        acceptReservation(eventId: Int!, reservationId: Int!): Reservation!
        rejectReservation(reservationId: Int!): Reservation!
        cancelReservation(reservationId: Int!): Boolean!
    }

    scalar DateTime
`;

module.exports = typeDefs;
