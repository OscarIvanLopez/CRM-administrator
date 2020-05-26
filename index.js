const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema.graphQL');
const resolvers = require('./db/resolvers');

// servidor
const server = new ApolloServer({
    typeDefs,
    resolvers
});


// Arracar el servidor
server.listen().then(({ url }) => {
    console.log(`Sevidor listo en la URL: ${url}`);
})
