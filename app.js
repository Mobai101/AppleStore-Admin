const compression = require("compression");
const socketIO = require("./util/socket");
const fs = require("fs");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const authRoute = require("./routes/auth");
const shopRoute = require("./routes/shop");
const adminRoute = require("./routes/admin");
const chatRoute = require("./routes/chat");
const errorController = require("./controllers/error");

const app = express();

const accessLogSteam = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// middleware
app.set("view engine", "ejs");
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());
app.use(cors());
app.use(morgan("combined", { stream: accessLogSteam }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/users", authRoute);
app.use("/admin", adminRoute);
app.use("/", shopRoute);
app.use("/chatrooms", chatRoute);

// Error
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
app.use(errorController.get404);

// App listen after mongo connected
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.abyljau.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
  )
  .then(() => {
    const server = app.listen(process.env.PORT || 5000);
    const io = socketIO.init(server);
    io.on("connection", (socket) => {});
  })
  .catch((err) => console.log(err));
