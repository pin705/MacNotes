import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFolder extends Document {
    name: string;
    userId: mongoose.Types.ObjectId;
    color: string;
    icon: string;
    createdAt: Date;
    updatedAt: Date;
}

const FolderSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'New Folder',
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    color: {
        type: String,
        default: '#eab308', // Yellow
    },
    icon: {
        type: String,
        default: 'folder',
    },
}, { timestamps: true });

FolderSchema.index({ userId: 1, name: 1 });

const Folder: Model<IFolder> = mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);

export default Folder;
