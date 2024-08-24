const cluster = require('cluster');
const initApp = require('./express-server');
const config = require('./config');
const prisma = require('./lib/prisma-client');
const dieGracefully= require('./lib/die-gracefully');



if (config.MULTI_PROC && cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < config.MAX_WORKERS; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        if (code !== 0) {
            console.error(`Worker ${worker.process.pid} exited with error code ${code}`);
        } else if (signal) {
            console.log(`Worker ${worker.process.pid} was killed by signal ${signal}`);
        } else {
            console.log(`Worker ${worker.process.pid} exited successfully.`);
        }

        console.log(`Forking a new worker...`);
        cluster.fork(); // Replace the dead worker with a new one
    });

} else {
    // Worker processes
    async function main() {

        // Ensure Prisma connection
        await prisma.$connect();
        console.log(`Prisma connected successfully in worker ${process.pid}`);

        // Set up the server with dependency injection
        const app = await initApp();

        // Start the server
        const server = app.listen(config.SERVER_PORT, () => {
            console.log(`Worker ${process.pid} is running, listening on port ${config.SERVER_PORT}`);
        });

        // Attach graceful shutdown
        process.on("unhandledRejection", async (err) => await dieGracefully("unhandledRejection", server, prisma, err));
        process.on("uncaughtException", async (err) => await dieGracefully("unhandledException", server, prisma, err));
        process.on("SIGTERM", async () => await dieGracefully("SIGTERM", server, prisma));
        process.on("SIGINT", async () => await dieGracefully("SIGINT", server, prisma));

    }

    main()
        .then(() => {
            console.log(`Worker ${process.pid} initialized successfully`);
        })
        .catch((error) => {
            console.error(`Worker ${process.pid} initialization failed:`, error);
            process.exit(1);
        });
}

