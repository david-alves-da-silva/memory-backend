const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).send('Token não fornecido');
  }

  // Verifica se o token contém o prefixo 'Bearer'
  const token = authHeader.split(' ')[1]; // Pega o token sem o prefixo 'Bearer'

  if (!token) {
    return res.status(403).send('Formato de token inválido');
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send('Token inválido');
    }
    req.user = decoded; // Adiciona os dados do usuário à requisição
    next();
  });
};

module.exports = authMiddleware;
