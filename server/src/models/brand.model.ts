import { Document, Schema, Types, model } from "mongoose";

export interface IBrand extends Document {
  name: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      require: true,
    },
    thumbnail: String,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Brand = model<IBrand>("brands", brandSchema);
