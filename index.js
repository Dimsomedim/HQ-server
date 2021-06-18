const express = require("express");
const cors = require("cors");
const path = require("path");

const { PORT = 4000 } = process.env;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    // credentials: true,
    // origin: originProd,
    origin: true,
  })
);

// Connect to mongo
const { dbConnect } = require("./utils/mongodb");

// Register routes
const proposals = require("./routes/proposals");
app.use("/api/proposals", proposals);

app.use("/", express.static(path.join(__dirname, "./public")));

app.get("*", (req, res) => {
  res.send("404");
});

const server = app.listen(PORT, () => {
  let db = dbConnect();
  if (db) console.log("MongoDB Connected!");
  console.log("server is running on port", server.address().port);
});
