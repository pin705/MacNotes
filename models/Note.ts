import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    default: 'New Note',
  },
  body: {
    type: String,
    required: false,
    default: '',
  },
}, { timestamps: true });

// Check if model already exists to prevent overwrite error in hot reload
const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
