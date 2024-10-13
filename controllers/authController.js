const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const secretKey = process.env.SECRET_KEY;

// Configuração do Nodemailer (ajuste conforme necessário)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Função para excluir um usuário
const excludeUser = async (req, res) => {
  const { username } = req.user; // Obtenha o nome de usuário do req.user
  try {
    await User.deleteOne({ username });
    console.log(`Usuário excluído: ${username}`);
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir o usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir o usuário', error });
  }
};

// Registro de Usuário
const registerUser = async (req, res) => {
  const { username, password, phone, email } = req.body;

  console.log('Iniciando o processo de registro...');

  // Verificar se o usuário já existe
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`Usuário já existe: ${username}`);
      return res.status(400).json({ message: 'Usuário já existe' });
    }
  } catch (error) {
    console.error('Erro ao verificar o usuário existente:', error);
    return res
      .status(500)
      .json({ message: 'Erro ao verificar o usuário', error });
  }

  // Verificar se o telefone já existe
  try {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      console.log(`Telefone já cadastrado: ${phone}`);
      return res.status(400).json({ message: 'Telefone já cadastrado' });
    }
  } catch (error) {
    console.error('Erro ao verificar o telefone existente:', error);
    return res
      .status(500)
      .json({ message: 'Erro ao verificar o telefone', error });
  }

  // Verificar se o e-mail já existe
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log(`E-mail já cadastrado: ${email}`);
      return res.status(400).json({ message: 'E-mail já cadastrado' });
    }
  } catch (error) {
    console.error('Erro ao verificar o e-mail existente:', error);
    return res
      .status(500)
      .json({ message: 'Erro ao verificar o e-mail', error });
  }

  // Hash da senha antes de armazenar
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Senha criptografada com sucesso.');

    const newUser = new User({
      username,
      password: hashedPassword,
      phone,
      email,
    });

    // Gera e salva o código de verificação
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    newUser.verificationCode = verificationCode;
    newUser.verificationAttempts = 0; // Inicializa o contador de tentativas

    await newUser.save();
    console.log(`Novo usuário criado: ${username}`);

    // Enviar o código de verificação por e-mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código de Verificação',
      text: `Seu código de verificação é: ${verificationCode}`,
    };

    // Enviar e-mail de forma assíncrona
    try {
      await transporter.sendMail(mailOptions);
      console.log('E-mail enviado com sucesso');
      res.status(201).json({
        message:
          'Usuário cadastrado com sucesso. Verifique seu e-mail para o código de verificação.',
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao enviar o código', error: error.message });
    }
  } catch (error) {
    console.error('Erro ao salvar o novo usuário:', error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário', error });
  }
};

// Login
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  console.log('Iniciando processo de login para o usuário:', username);

  // Verifique as credenciais do usuário
  const user = await User.findOne({ username });
  if (!user) {
    console.log('Usuário não encontrado:', username);
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  // Verifique se a senha está correta
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.log('Senha incorreta para o usuário:', username);
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  // Gere o token JWT
  const token = jwt.sign({ username: user.username }, secretKey, {
    expiresIn: '1h',
  });

  console.log('Login bem-sucedido, token gerado para o usuário:', username);

  // Retorne o token e uma mensagem de sucesso
  return res.json({
    message: 'Login bem-sucedido',
    token,
    username: user.username,
  });
};

// Verificar o código de verificação
const verifyCode = async (req, res) => {
  const { username, verificationCode } = req.body;
  console.log('Iniciando verificação de código para o usuário:', username);

  // Verifique se o usuário existe
  const user = await User.findOne({ username });
  if (!user) {
    console.log('Usuário não encontrado:', username);
    return res.status(401).json({ message: 'Usuário não encontrado' });
  }

  // Adicione um campo para contar as tentativas, se não existir
  if (!user.verificationAttempts) {
    user.verificationAttempts = 0;
  }

  // Verifique se o código de verificação está correto
  if (user.verificationCode !== verificationCode) {
    user.verificationAttempts += 1; // Incrementa o contador

    console.log('Código de verificação inválido para o usuário:', username);

    // Se o número de tentativas atingir 3, exclua o usuário
    if (user.verificationAttempts >= 3) {
      await excludeUser(req, res); // Exclui o usuário
      return; // Evitar continuar após a exclusão
    }

    await user.save(); // Salva o número de tentativas
    return res
      .status(401)
      .json({ message: 'Código de verificação inválido. Tente novamente.' });
  }

  console.log('Código de verificação correto, gerando token JWT...');

  // Código válido, gere o token JWT
  const token = jwt.sign({ username: user.username }, secretKey, {
    expiresIn: '1h',
  });

  // Resetar tentativas após sucesso
  user.verificationAttempts = 0;
  await user.save(); // Salva as alterações no usuário

  console.log('Token gerado com sucesso para o usuário:', username);
  res.json({
    message: 'Código verificado com sucesso. Login bem-sucedido!',
    token,
  });
};

// Logout
const logoutUser = async (req, res) => {
  res.json({ message: 'Logout bem-sucedido' });
};

// Exportar as funções
module.exports = {
  registerUser,
  loginUser,
  verifyCode,
  logoutUser,
  excludeUser,
};
