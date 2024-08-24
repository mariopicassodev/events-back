async function gracefulShutdown(signal, server, prisma, err=null) {
    if (err) {
        console.error(`Worker ${process.pid} encountered an error:`, err);
    }
    console.log(`Worker ${process.pid} received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
        console.log(`Worker ${process.pid} closed all connections.`);
        try {
            await prisma.$disconnect();
            console.log(`Worker ${process.pid} disconnected from database.`);
            process.exit(0);
        } catch (err) {
            console.error(`Worker ${process.pid} failed to disconnect from database:`, err);
            process.exit(1);
        }
    });

    // Force shutdown after a timeout
    setTimeout(() => {
        console.error(`Worker ${process.pid} forced shutdown due to timeout.`);
        process.exit(1);
    }, 10000); // 10 seconds timeout
}

module.exports = gracefulShutdown;
