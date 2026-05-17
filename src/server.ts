import app from "./app";
import Database from "./config/db";
import "dotenv/config"


async function startSever() {
    const db = Database.getInstance()
    const isConnected = await db.healthCheck()
    if (!isConnected) process.exit(1)

    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`)
        console.log("Pool status :", db.getPoolStatus());
    })

    process.on("SIGINT", async () => {
        console.log("Server shutting down")
        await db.close();
        process.exit(0);
    })
    process.on("SIGTERM", async () => {
        console.log("Server shutting down")
        await db.close();
        process.exit(0);
    })

}

startSever();