import express from 'express';
import bodyParser from 'body-parser';
import flashcardRoutes from './routes/flashcardRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import setupSwagger from './swagger.js';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import authenticateAdmin from './middleware/adminAuth.js'

import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    credentials: true,
    preflightContinue: true,
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


app.use('/api/flashcards', flashcardRoutes);
app.use('/api/users', userRoutes);


import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/mongoose';
import User from './models/User.js';
import Flashcard from './models/Flashcard.js';

AdminJS.registerAdapter({ Database, Resource });

const adminJs = new AdminJS({
    resources: [
        { resource: User },
        { resource: Flashcard },
    ],
    rootPath: '/admin',
});

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate: async (email, password) => {
        return await authenticateAdmin(email, password);
    },
    cookieName: 'adminjs',
    cookiePassword: 'somepassword',
});

app.use(adminJs.options.rootPath, adminRouter);

setupSwagger(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});