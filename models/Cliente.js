const mongoose = require("mongoose");

const ClientesSchema = mongoose.Schema({
  nombre: {
    type: String,
    requiere: true,
    trim: true,
  },
  apellido: {
    type: String,
    require: true,
    trim: true,
  },
  epresa: {
    type: String,
    requiere: true,
    trim: true,
  },
  email: {
    type: String,
    requiere: true,
    trim: true,
    unique: true,
  },
  telefono: {
    type: String,
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Usuario'
  }
});

module.exports = mongoose.model("Cliente", ClientesSchema);
