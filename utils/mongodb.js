require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;

const DB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}`;

let db = new MongoClient(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dbConnect = () => {
  try {
    db.connect();
    return true;
  } catch (err) {
    return new Error("Could not connect to db " + err);
  }
};

const getDb = async () => {
  return db;
};

module.exports = {
  dbConnect,
  getDb,
};
