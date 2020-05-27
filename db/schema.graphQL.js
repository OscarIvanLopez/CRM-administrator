const { gql } = require('apollo-server')

//schema
const typeDefs = gql`

    type Query {
        obtenerCursos: String
    }
`;

module.exports = typeDefs;