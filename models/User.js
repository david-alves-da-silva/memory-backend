const mongoose = require('mongoose');

// Expressão regular para validar números de telefone com espaços opcionais
const phoneRegex = /^\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationCode: { type: String },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        // Validação simples para verificar o formato do e-mail
        return /^\S+@\S+\.\S+$/.test(v); // Exemplo: valida um formato básico de e-mail
      },
      message: (props) => `${props.value} não é um e-mail válido!`,
    },
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        // Validação para verificar o formato do telefone com 10 dígitos e espaços opcionais
        return phoneRegex.test(v);
      },
      message: (props) => `${props.value} não é um número de telefone válido!`,
    },
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
