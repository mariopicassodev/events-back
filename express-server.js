const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { expressMiddleware } = require('@apollo/server/express4');
const config = require('./config');
const createSignInRoute = require('./api/signin');
const createApolloServer = require('./lib/create-apollo-server')
const authMiddleware = require('./middlewares/auth-middleware');
const Rollbar = require('rollbar');


async function initApp(prisma) {

    // include and initialize the rollbar library with your access token

    const rollbar = new Rollbar({
        accessToken: process.env.ROLLBAR_KEY,
        captureUncaught: true,
        captureUnhandledRejections: true,
    })

    const app = express();

    // Middleware
    app.use(cors({ origin: config.CORS_ORIGIN }));
    app.use(express.json());
    app.use(morgan('dev'));
    app.use(rollbar.errorHandler());
    app.use('/api/auth/signin', createSignInRoute(prisma, rollbar));
    app.use(authMiddleware);

    // Apollo Server
    const apolloServer = await createApolloServer(rollbar);
    app.use('/graphql', expressMiddleware(apolloServer, {
        context: async ({ req }) => {
            return {
                prisma,
            };
        },
    }));

    return app;
}

module.exports = initApp;
