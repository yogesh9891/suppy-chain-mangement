import { Document, Schema, Types, model } from "mongoose";

export interface ISize extends Document {
  name: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const sizeSchema = new Schema<ISize>(
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

export const Size = model<ISize>("sizes", sizeSchema);
