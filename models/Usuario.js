const mongoose = require("mongoose");

//! Schema de la base de datos
const UsuarioSchema = mongoose.Schema({
  nombre: {
    type: String,
    require: true,
    trim: true,
  },
  apellido: {
    type: String,
    require: true,
    trim: true,
  },
  email: {
    type: String,
    require: true,
    trim: true,
    //! UNIQUE funciona para validar que solo este registrado un correo
    unique: true,
  },
  password: {
    type: String,
    require: true,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
