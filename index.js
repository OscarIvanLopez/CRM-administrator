const { ApolloServer } = require("apollo-server");
const typeDefs = require("./db/schema.graphQL");
const resolvers = require("./db/resolvers.js");
const conectarDB = require("./config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });

//Conectar con la base de datos
conectarDB();

//servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // console.log(req.headers["authorization"]);

    // console.log(req.headers);
    
    const token = req.headers["authorization"] || "";
    if (token) {
      try {
        const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);

        console.log(usuario);

        return {
          usuario,
        };
      } catch (error) {
        console.log(error);
      }
    }
  },
});

//arrancar el servidor
server.listen().then(({ url }) => {
  console.log(`Servidor en el puerto ${url}`);
});
