const Usuario = require("../models/Usuario");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const Pedido = require("../models/Pedido");

const bcryptjs = require("bcryptjs");
require("dotenv").config({ path: "variables.env" });
const jwt = require("jsonwebtoken");

const crearToken = (usuario, secreta, expiresIn) => {
  console.log(usuario);
  const { id, email, nombre, apellido } = usuario;
  return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn });
};
//comment
//resolvers
const resolvers = {
  Query: {
    obtenerUsuario: async (_, { token }) => {
      const usuarioId = await jwt.verify(token, process.env.SECRETA);

      return usuarioId;
    },
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find({});
        return productos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, { id }) => {
      // Revisar si el producto existe o no
      const producto = Producto.findById(id);

      if (!producto) {
        throw new Error("El producto no existe");
      }

      return producto;
    },
    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_, {}, ctx) => {
      try {
        const clientes = await Cliente.find({
          vendedor: ctx.usuario.id.toString(),
        });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_, { id }, ctx) => {
      //Revisar si el cliente existe o no
      const cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      //Quien lo creo puede verla
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("Este cliente no te corresponde");
      }

      // Retornar el resultado
      return cliente;
    },
    obtenerPedidos: async () => {
      try {
        const pedidos = await Pedido.find({});
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosVendedor: async (_, {}, ctx) => {
      try {
        const pedidos = await Pedido.find({
          vendedor: ctx.usuario.id,
        });
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedido: async (_, { id }, ctx) => {
      // Si el pedido existe o no
      const pedido = await Pedido.findById(id);

      if (!pedido) {
        throw new Error("El pedido no existe");
      }

      // Solo quien lo creo puede verlo
      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("Este cliente no te corresponde");
      }

      // Retornar el resultado
      return pedido;
    },
    obtenerPedidosEstado: async (_, { estado }, ctx) => {
      const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado });

      return pedidos;
    },
    mejoresClientes: async () => {
      const cliente = await Pedido.aggregate([
        { $match: { estado: "COMPLETADO" } },
        {
          $group: {
            _id: "$cliente",
            total: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "clientes",
            localField: "_id",
            foreignField: "_id",
            as: "cliente",
          },
        },
        {
          $sort: { total: -1 },
        },
      ]);
      return cliente;
    },
  },

  Mutation: {
    nuevoUsuario: async (_, { input }) => {
      const { email, password } = input;

      // Revisar si el usuario ya esta registrado
      const existeUsuario = await Usuario.findOne({ email });
      if (existeUsuario) {
        throw new Error("El usuario ya esta registrado");
      }

      // Hashear su password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      // Guardarlo en la base de datos
      try {
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (error) {
        console.log(error);
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;

      //Si el usuario existe
      const existeUsuario = await Usuario.findOne({ email });

      if (!existeUsuario) {
        throw new Error("El usuario no existe");
      }

      // Revisar si el password es correcto
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );

      if (!passwordCorrecto) {
        throw new Error("El Password es incorrecto");
      }

      // Crear el token
      return {
        token: crearToken(existeUsuario, process.env.SECRETA, "24h"),
      };
    },
    nuevoProducto: async (_, { input }) => {
      try {
        const producto = new Producto(input);

        //guardamos en la base de datos
        const resultado = await producto.save();

        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      let producto = await Producto.findById(id);

      if (!producto) {
        throw new Error("El usuario no existe");
      }

      // Si el producto si existe lo pasamos a la base de datos
      producto = await Producto.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return producto;
    },
    eliminarProducto: async (_, { id }) => {
      const producto = Producto.findById(id);

      if (!producto) {
        throw new Error("El producto no existe");
      }

      //! Eliminar el producto
      await Producto.findByIdAndDelete({ _id: id });

      return "Producto Eliminado";
    },
    nuevoCliente: async (_, { input }, ctx) => {
      //destructuring
      const { email } = input;

      //* verificar si el cliente ya esta regitrado

      const cliente = await Cliente.findOne({ email });

      if (cliente) {
        throw new Error("El cliente ya esta registrado");
      }

      const nuevoCliente = new Cliente(input);
      //* Asignar el vendeor
      nuevoCliente.vendedor = ctx.usuario.id;

      try {
        // guardarlo en la base de datos
        const resultado = await nuevoCliente.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarCliente: async (_, { id, input }, ctx) => {
      //verificar si existe o no
      let cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error("Ese cliente no existe");
      }
      //verificar si el vendedor es el que edita
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("Este cliente no te corresponde");
      }
      //guardar el cliente
      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return cliente;
    },
    eliminarCliente: async (_, { id }, ctx) => {
      const cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("El cliente no existe");
      }

      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("El cliente no te corresponde");
      }

      //! Eliminar el cliente

      await Cliente.findOneAndDelete({ _id: id });

      return "Cliente eliminado";
    },
    nuevoPedido: async (_, { input }, ctx) => {
      const { cliente } = input;

      //Verificar si el cliente exite o no
      const clienteExiste = await Cliente.findById(cliente);
      if (!clienteExiste) {
        throw new Error("El cliente no existe");
      }

      //Verificar si el cliente es del vendedor
      if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("Este cliente no te corresponde");
      }

      //Revisar si el stock esta disponible
      for await (const articulo of input.pedido) {
        const { id } = articulo;

        const producto = await Producto.findById(id);

        if (articulo.cantidad > producto.existencia) {
          throw new Error(
            `El articulo: ${producto.nombre} excede la cantidad disponible`
          );
        } else {
          //Restar la cantidad a lo disponible
          producto.existencia = producto.existencia - articulo.cantidad;

          await producto.save();
        }
      }
      //crear un nuevo pedido
      const nuevoPedido = new Pedido(input);

      //Asignarle un vendedor
      nuevoPedido.vendedor = ctx.usuario.id;

      //Guardar en la base de datos
      const resultado = await nuevoPedido.save();

      return resultado;
    },
    actualizarPedido: async (_, { id, input }, ctx) => {
      const { cliente } = input;

      //Verificar si el pedido existe o no
      const existePedido = await Pedido.findById(id);
      if (!existePedido) {
        throw new Error("El pedido no existe");
      }

      //Verificar si el cliente existe o no
      const existeClidente = await Cliente.findById(cliente);
      if (!existeClidente) {
        throw new Error("El cliente no existe");
      }

      //Verificar si el vendedor es el que edita
      if (existeClidente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("El pedido no te corresponde");
      }

      //Revisar el stock
      if (input.pedido) {
        for await (const articulo of input.pedido) {
          const { id } = articulo;

          const producto = await Producto.findById(id);
          if (articulo.cantidad > producto.existencia) {
            throw new Error(
              `El articulo: ${producto.nombre} excede la cantidad disponible`
            );
          } else {
            //Restar la cantidad a lo disponible
            producto.existencia = producto.existencia - articulo.cantidad;

            await producto.save();
          }
        }
      }

      //Guardar el pedido
      const resultado = await Pedido.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      //Retornamos el resultado
      return resultado;
    },
    eliminarPedido: async (_, { id }, ctx) => {
      // Verificar si el pedido existo o no
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        throw new Erro("El pedido no existe");
      }

      //Verificar si el vendedor es quien lo borra
      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("El cliente no te corresponde");
      }

      //eliminamos de la base de datos
      await Pedido.findOneAndDelete({ _id: id });
      return "Pedido borrado";
    },
  },
};

module.exports = resolvers;
