// Description: This file contains the type definitions for the GraphQL schema.
typeDefs = `#graphql
    type User {
        id: Int
        email: String
        name: String
        events: [Event]
        applications: [Application]
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
        applications: [Application]
        createdAt: DateTime
        updatedAt: DateTime
    }

    type Application {
        id: Int
        eventId: Int
        event: Event
        userId: Int
        user: User
        status: ApplicationStatus
        createdAt: DateTime
        updatedAt: DateTime
    }

    enum ApplicationStatus {
        PENDING
        ACCEPTED
        REJECTED
    }

    type Query {
        users: [User]
        user(id: Int!): User
        upcomingEvents: [Event]
        event(id: Int!): Event
        userEvents(userId: Int!): [Event]
        applications: [Application]
        application(id: Int!): Application
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
        ): Event
        createApplication(eventId: Int!, userId: Int!): Application
        acceptApplication(id: Int!): Application
        rejectApplication(id: Int!): Application
    }

    scalar DateTime
`;

module.exports = typeDefs;
