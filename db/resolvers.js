//resolvers
const resolvers = {
    Query: {
        obtenerCursos: () => "algo"
    },

    Mutation: {
        nuevoUsuario: (_, { input }) => {
            console.log(input);
            return "Creando..."
        }
    }
}
module.exports = resolvers;