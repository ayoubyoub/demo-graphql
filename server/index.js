require("dotenv").config();
const { ApolloServer, PubSub } = require("apollo-server");
const mongoose = require("mongoose");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

// instantiate instance of PubSub()
const pubsub = new PubSub();

const PORT = process.env.PORT || 5000;

// setup apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // callback. this is middleware so we get the req/res from express and then forward it to the context, which we can then access in graphql posts resolver
  // pass pubsub instance to context so we can use it in our resolvers
  context: ({ req }) => ({ req, pubsub }),
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected");
    return server.listen({ port: PORT });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  })
  .catch((err) => {
    console.error(err);
  });
