import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token = req.cookies.token;

    // const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);


    if (!token) {
      console.warn('Аутентификация не удалась: токен отсутствует.');
      return res.status(401).json({ error: 'Токен отсутствует. Необходима аутентификация.' });
    }

    jwt.verify(token, 'secretkey', (err, user) => {
      if (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(403).json({ error: 'Недействительный токен. Доступ запрещён.' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Ошибка в аутентификации:', error.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
  }
};

export default authenticateToken;
