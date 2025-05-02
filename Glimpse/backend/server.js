const app = require("./app");
const http = require("http");
const net = require("net");
const connectToDatabase = require("./database");

async function testDBConnection(
  host = process.env.MONGO_HOST,
  port = process.env.MONGO_PORT,
  timeout = 5000
) {
  if (!host) {
    throw new Error("MONGO_HOST is not defined!");
  }
  port = parseInt(port, 10) || 27017;

  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    // If connection doesn't happen within `timout` ms, abort.
    socket.setTimeout(timeout, () => {
      socket.destroy();
      reject(
        new Error(`TCP ping to ${host}:${port} timed out after ${timeout}ms`)
      );
    });

    socket.once("error", (err) => {
      socket.destroy();
      reject(err);
    });

    socket.connect(port, host, () => {
      socket.end();
      resolve();
    });
  });
}

async function startServer(retries = 5, delayMs = 5000) {
  try {
    console.log("Pinging database");
    await testDBConnection();
    console.log("Ping successful! Starting mongoose connection.");
  } catch (err) {
    console.log("Ping failed!");
    console.log(err.message);
  }

  while (retries > 0) {
    try {
      await connectToDatabase();
      break;
    } catch (err) {
      retries--;
      console.log("DB connection failed, retrying in", delayMs, "ms.");
      console.log("Retries remaining:", retries);
      console.log("Error:", err);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  if (retries === 0) {
    console.log("Failed to connect to DB after multiple retries.");
    return;
  }

  const port = normalizePort(process.env.PORT || "8080"); // EB default is port 8080
  app.set("port", port);

  const server = http.createServer(app);
  server.on("error", (error) => onError(error, server, port));
  server.on("listening", () => onListening(server, port));
  server.listen(port);
}

const normalizePort = (val) => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }
  return false;
};

const onError = (error, server, port) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
};

const onListening = (server, port) => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  console.log("Listening on " + bind);
};

startServer();
