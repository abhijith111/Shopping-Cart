const mongoClient = require("mongodb").MongoClient;
const state = {
  db: null,
};
module.exports.connect = (done) => {
  const url = "mongodb://localhost:27017";
  const dbname = "shopping";

  mongoClient.connect(url, (err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
    done();
  });
};

module.exports.get = () => {
  return state.db;
};

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://dbUserAbhi:Abhijith@#123@cluster0.m34nr.gcp.mongodb.net/shopping?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
