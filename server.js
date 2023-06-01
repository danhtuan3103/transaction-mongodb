require("dotenv/config");
const app = require("./app");
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected ...."))
  .catch((err) => console.log("MongoDb Error : " + err.message));

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
