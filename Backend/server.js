import app from "./src/app.js";
import connectToDb from "./src/config/database.js";
import http from "http"
import { initSocket } from "./src/Sockets/server.socket.js";
import "./src/workers/email.worker.js";


const httpServer = http.createServer(app)
initSocket(httpServer)

connectToDb()
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});