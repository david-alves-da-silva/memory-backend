require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const app = express();
const PORT = process.env.PORT || 4000;

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutos
  max: 3, // limite de 5 requisições
  message: 'Muitas tentativas tente mais tarde.',
});

app.use(cors());
const connectDB = require('./db');

app.use(express.json());

connectDB();

app.use('/auth/login', loginLimiter);
app.use('/auth', authRoutes);
app.use('/game', gameRoutes);

app.get('/', (req, res) => {
  res.send('Backend funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
