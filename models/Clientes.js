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
  email: {
    type: String,
    require: false,
    trim: true,
  }, 
});

module.exports = mongoose.model("Cliente", ClientesSchema);
