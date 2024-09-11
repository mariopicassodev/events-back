const { ApolloServer } = require('@apollo/server');
const typeDefs = require('../graphql/typeDef');
const resolvers = require('../graphql/resolvers');


async function createApolloServer(rollbar) {
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        formatError: (error) => {
            rollbar.error(error);
            return error;
        },
    });

    await apolloServer.start();
    return apolloServer;
}

module.exports = createApolloServer;
