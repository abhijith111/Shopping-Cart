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
// mongodb://localhost:27017
// mongodb+srv://dbUserAbhi:abhi1234@cluster0.m34nr.mongodb.net/<dbname>?retryWrites=true&w=majority