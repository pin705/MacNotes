import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
  title: string;
  body: string;
  userId: mongoose.Types.ObjectId;
  folderId?: mongoose.Types.ObjectId;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
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
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  folderId: {
    type: Schema.Types.ObjectId,
    ref: 'Folder',
    required: false,
  },
  tags: {
    type: [String],
    default: [],
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    required: false,
  },
}, { timestamps: true });

// Compound index for efficient queries
NoteSchema.index({ userId: 1, isDeleted: 1, isPinned: -1, updatedAt: -1 });

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
