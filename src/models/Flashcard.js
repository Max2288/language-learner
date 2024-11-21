import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, default: 0 },
});

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

export default Flashcard;