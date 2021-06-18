const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUsa:kbzwrAGIBioBIOBASGOIBaasi@cluster0.1svwj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("snapvotes").collection("devices");
  if(err) {console.log(err)}
//   client.close();
});