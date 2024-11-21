import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from '../routes/userRoutes.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

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
    await User.deleteMany({});
    const user = new User({ username: 'testuser', password: 'password123', role: 'user' });
    await user.save();
});

describe('User Routes', () => {
    describe('POST /api/users/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser12356',
                    password: 'password123',
                });
            expect(response.status).toBe(201);
            expect(response.body.username).toBe('testuser12356');
        });

        it('should return 400 for duplicate username', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser',
                    password: 'password456',
                });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Некорректные данные или пользователь с такими данными уже существует.');
        });
    });

    describe('POST /api/users/login', () => {
        it('should login a user and return a token', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    username: 'testuser',
                    password: 'password123',
                });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Успешный вход.');
        });

        it('should return 401 for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    username: 'nonexistentuser',
                    password: 'wrongpassword',
                });
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Неверные учетные данные.');
        });
    });

    describe('GET /api/users/profile', () => {
        it('should return user profile when authenticated', async () => {
            const user = await User.findOne({ username: 'testuser' });
            const token = user.generateAuthToken()
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .set('test', true)
            ;

            expect(response.status).toBe(200);
            expect(response.body.user.username).toBe('testuser');
            expect(response.body.message).toBe('Добро пожаловать на страницу профиля!');
        });

        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .expect(401);

            expect(response.body.error).toBe('Токен отсутствует. Необходима аутентификация.');
        });
    });
});
