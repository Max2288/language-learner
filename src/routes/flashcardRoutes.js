import express from 'express';
const router = express.Router();
import Flashcard from '../models/Flashcard.js';
import authenticateToken from'../middleware/authenticateToken.js';

/**
 * @swagger
 * tags:
 *   name: Flashcards
 *   description: Flashcard management
 */

/**
 * @swagger
 * /api/flashcards:
 *   post:
 *     summary: Create a flashcard
 *     tags: [Flashcards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *               translation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Flashcard created successfully.
 */
router.post('/', authenticateToken, async (req, res) => {
  const { word, translation } = req.body;
  const userId = req.user.id; // Получаем ID пользователя из токена

  const flashcard = new Flashcard({
    word,
    translation,
    user: userId
  });

  try {
    await flashcard.save();
    res.status(201).send(flashcard);
  } catch (error) {
    res.status(400).send(error);
  }
});

/**
 * @swagger
 * /api/flashcards:
 *   get:
 *     summary: Get all flashcards
 *     tags: [Flashcards]
 *     responses:
 *       200:
 *         description: A list of flashcards.
 */
router.get('/', async (req, res) => {
  try {
    const flashcards = await Flashcard.find().populate('user', 'username');
    res.send(flashcards);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @swagger
 * /api/flashcards/{id}/rate:
 *   patch:
 *     summary: Rate a flashcard
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the flashcard to rate.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Flashcard rated successfully.
 */
router.patch('/:id/rate', async (req, res) => {
  try {
    const flashcard = await Flashcard.findByIdAndUpdate(req.params.id, { $inc: { rating: req.body.rating } }, { new: true });
    if (!flashcard) {
      return res.status(404).send({ message: 'Карточка не найдена.' });
    }
    res.send(flashcard);
  } catch (error) {
    res.status(400).send({ message: 'Ошибка при обновлении карточки.', error });
  }
});

/**
 * @swagger
 * /api/flashcards/{id}:
 *   delete:
 *     summary: Delete a flashcard
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the flashcard to delete.
 *         schema:
 *           type: string
 *
*     responses:
*       200:
*         description: Flashcard deleted successfully.
*       403:
*         description: Access denied. Only admins can delete flashcards.
*       404:
*         description: Flashcard not found.
*/
router.delete('/:id', authenticateToken, async (req, res) => {
  // Проверяем, является ли пользователь администратором
  if (req.user.role !== 'admin') {
    return res.status(403).send({ message: 'Доступ запрещён. Только администраторы могут удалять карточки.' });
  }

  try {
    const flashcard = await Flashcard.findByIdAndDelete(req.params.id);
    if (!flashcard) {
      return res.status(404).send({ message: 'Карточка не найдена.' });
    }
    res.send({ message: 'Карточка успешно удалена.', flashcard });
  } catch (error) {
    res.status(500).send({ message: 'Ошибка при удалении карточки.', error });
  }
});


export default router;