const { ApolloServer } = require("apollo-server");
const typeDefs = require("./db/schema.graphQL");
const resolvers = require("./db/resolvers.js");
const conectarDB = require("./config/db");

//Conectar con la base de datos
conectarDB();

//servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

//arrancar el servidor
server.listen().then(({ url }) => {
    console.log(`Servidor en el puerto ${url}`);
});
