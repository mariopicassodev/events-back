const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { expressMiddleware } = require('@apollo/server/express4');
const config = require('./config');
const createSignInRoute = require('./api/signin');
const createApolloServer = require('./lib/create-apollo-server')


async function initApp() {
    const app = express();

    // Middleware
    app.use(cors({ origin: config.CORS_ORIGIN }));
    app.use(express.json());
    app.use(morgan('dev'));

    // Authentication routes
    app.use('/api/auth/signin', createSignInRoute());

    // Apollo Server
    const apolloServer = await createApolloServer();
    app.use('/graphql', expressMiddleware(apolloServer));

    return app;
}

module.exports = initApp;
