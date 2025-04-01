const app = require("./app");
const http = require("http");
const connectToDatabase = require("./database");

async function startServer() {
  await connectToDatabase();

  const port = normalizePort(process.env.PORT || "3000");
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
