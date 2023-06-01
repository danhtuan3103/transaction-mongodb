const express = require("express");
const moneyRoute = require("./routers/money.js");
const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello");
});
app.use(moneyRoute);

module.exports = app;
