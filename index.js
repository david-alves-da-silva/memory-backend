require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const app = express();
const PORT = process.env.PORT || 4000;
const corsOptions = {
  origin: 'https://david-alves-da-silva.github.io',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));
const connectDB = require('./db');

app.use(express.json());

connectDB();

app.use('/auth', authRoutes);
app.use('/game', gameRoutes);

app.get('/', (req, res) => {
  res.send('Backend funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
