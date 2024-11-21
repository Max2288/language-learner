import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import flashcardRoutes from '../routes/flashcardRoutes.js';
import Flashcard from '../models/Flashcard.js';
import User from '../models/User.js';

const app = express();
app.use(express.json());
app.use('/api/flashcards', flashcardRoutes);

beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/language_learning_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await Flashcard.deleteMany({});
    await User.deleteMany({});
    const user = new User({username: `testuser2`, password: 'password123', role: 'user'});
    await user.save();
    const admin = new User({username: `admin2`, password: 'adminpassword', role: 'admin'});
    await admin.save();
});

describe('Flashcard Routes', () => {
    describe('POST /api/flashcards', () => {
        it('should create a new flashcard with a valid token', async () => {
            const user = await User.findOne({username: 'testuser2'});
            const token = user.generateAuthToken()
            const response = await request(app)
                .post('/api/flashcards')
                .set('Authorization', `Bearer ${token}`)
                .send({word: 'apple', translation: 'яблоко'});
            expect(response.status).toBe(201);
            expect(response.body.word).toBe('apple');
            expect(response.body.translation).toBe('яблоко');
        });

        it('should return 401 if token is not provided', async () => {
            const response = await request(app)
                .post('/api/flashcards')
                .send({word: 'apple', translation: 'яблоко'});
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Токен отсутствует. Необходима аутентификация.');
        });
    });

    describe('GET /api/flashcards', () => {
        it('should return a list of flashcards', async () => {
            const user = new User({username: `testuser2`, password: 'password123', role: 'user'});
            const token = user.generateAuthToken()
            await request(app)
                .post('/api/flashcards')
                .set('Authorization', `Bearer ${token}`)
                .send({word: 'banana', translation: 'банан'});

            const response = await request(app).get('/api/flashcards');
            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });

    describe('PATCH /api/flashcards/:id/rate', () => {
        it('should rate a flashcard', async () => {
            const user = new User({username: `testuser3`, password: 'password123', role: 'user'});
            const token = user.generateAuthToken()
            const flashResponse = await request(app)
                .post('/api/flashcards')
                .set('Authorization', `Bearer ${token}`)
                .send({word: 'banana', translation: 'банан'});
            const flashcardId = flashResponse.body._id;
            const response = await request(app)
                .patch(`/api/flashcards/${flashcardId}/rate`)
                .send({rating: 5});

            expect(response.status).toBe(200);
            expect(response.body.rating).toBe(5);
        });

        it('should return 404 if flashcard is not found', async () => {
            const response = await request(app)
                .patch('/api/flashcards/672dafb84ba10b40f3812bc3/rate')
                .send({rating: 5});

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Карточка не найдена.');
        });
    });

    describe('DELETE /api/flashcards/:id', () => {
        it('should delete a flashcard if user is an admin', async () => {
            const user = new User({username: `testuser4`, password: 'password123', role: 'admin'});
            const token = user.generateAuthToken()
            const flashResponse = await request(app)
                .post('/api/flashcards')
                .set('Authorization', `Bearer ${token}`)
                .send({word: 'banana', translation: 'банан'});
            const flashcardId = flashResponse.body._id;
            const response = await request(app)
                .delete(`/api/flashcards/${flashcardId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Карточка успешно удалена.');
        });

        it('should return 403 if user is not an admin', async () => {
            const user = new User({username: `testuser5`, password: 'password123', role: 'user'});
            const token = user.generateAuthToken()
            const flashResponse = await request(app)
                .post('/api/flashcards')
                .set('Authorization', `Bearer ${token}`)
                .send({word: 'banana', translation: 'банан'});
            const flashcardId = flashResponse.body._id;
            const response = await request(app)
                .delete(`/api/flashcards/${flashcardId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Доступ запрещён. Только администраторы могут удалять карточки.');
        });

        it('should return 404 if flashcard not found', async () => {
            const user = new User({username: `testuser5`, password: 'password123', role: 'admin'});
            const token = user.generateAuthToken()
            const response = await request(app)
                .delete('/api/flashcards/672dafb84ba10b40f3812bc3')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Карточка не найдена.');
        });
    });
});
