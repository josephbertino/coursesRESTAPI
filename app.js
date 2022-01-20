"use strict";

// load modules
const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");
const { sequelize } = require("./models");

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan("dev"));

// setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to User/Courses API!",
  });
});

// Add routes
app.use("/api", routes);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
  });
});

// set our port
app.set("port", process.env.PORT || 5000);

// Use Sequelize's `authenticate` function to test the database connection.
// A message should be logged to the console informing the user whether the connection was
// successful
(async () => {
  try {
    await sequelize.authenticate();
    console.log("The database connection is established.");
  } catch (error) {
    console.error("Unable to connect to the database: ", error);
  }
})();

// We should start listening on the port once we've synced with the sequelize db
sequelize
  .sync()
  .then(() => {
    const server = app.listen(app.get("port"), () => {
      console.log(
        `Express server is listening on port ${server.address().port}`
      );
    });
  })
  .catch((error) => {
    throw error;
  });
