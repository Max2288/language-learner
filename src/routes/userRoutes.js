import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import authenticateToken from'../middleware/authenticateToken.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Invalid input or user already exists.
 */
router.post('/register', async (req, res) => {
  const user = new User(req.body);
  if (user.username === 'admin'){
    user.role = 'admin'
  }
  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send({ message: 'Некорректные данные или пользователь с такими данными уже существует.' });
  }
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials.
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || !(await user.isValidPassword(password))) {
    return res.status(401).send({ message: 'Неверные учетные данные.' });
  }

  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, 'secretkey', { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true, secure: true });
  res.send({ message: 'Успешный вход.', token: token });
});

/**
* @swagger
* /api/users/profile:
*   get:
*     summary: Get user profile
*     tags: [Users]
*     responses:
*       200:
*         description: User profile retrieved successfully.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                 user:
*                   type: object
*                   properties:
*                     username:
*                       type: string
*                     id:
*                       type: string
*       401:
*         description: Authentication required.
*/
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Добро пожаловать на страницу профиля!', user: req.user });
});

export default router;