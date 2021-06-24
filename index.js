const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;
const routes = require("./routes");

// Middleware
app.use(cors({
  origin: ["http://localhost:3000"]
}));
app.use("/api", routes);

const server = app.listen(PORT, () => {
  console.log("Listening to port", PORT);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  wsEngine: require("eiows").Server
});
require("./socket")(io);