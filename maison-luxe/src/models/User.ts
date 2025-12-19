import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  favorites: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Index pour recherche rapide
    },
    password: {
      type: String,
      required: false, // OAuth users may not have un mot de passe local
      default: '',
      validate: {
        validator: function (v: string) {
          // Si password est défini et non vide, il doit faire au moins 6 caractères
          return !v || v.length >= 6;
        },
        message: 'Password must be at least 6 characters',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    favorites: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
  },
  {
    timestamps: true,
  }
);

// Forcer la suppression du modèle du cache Mongoose en mode développement
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
