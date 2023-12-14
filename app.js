const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");
const Sequelize = require("sequelize");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const db = require("./models");

const app = express();

let ALLOWED_ORIGINS = [
  "http://localhost:4200",
  "https://naktraining.intelehealth.org",
  "http://localhost:3030",
  "https://naktraining.intelehealth.org:3030",
  "http://127.0.0.1:3030"
];

app.use(function (req, res, next) {
  const origin = req.headers.origin;
  const theOrigin =
    ALLOWED_ORIGINS.indexOf(origin) >= 0 ? origin : ALLOWED_ORIGINS[0];

  res.header("Access-Control-Allow-Origin", theOrigin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("trust proxy", 1); // trust first proxy

db.sequelize.define("Session", {
  sid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  rememberme: Sequelize.BOOLEAN,
  expires: Sequelize.DATE,
  data: Sequelize.TEXT,
});

app.set("trust proxy", 1);
app.use(
  session({
    name: "app.sid",
    secret: process.env.DOMAIN,
    store: new SequelizeStore({
      db: db.sequelize,
      checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
      expiration: 15 * 24 * 60 * 60 * 1000, // The maximum age (in milliseconds) of a valid session.
    }),
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/api", require("./routes/index"));
app.use("/notification", require("./routes/pushNotification"));
app.use(require("./handlers/error-handler"));

module.exports = app;
