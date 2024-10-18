import { Document, Schema, Types, model } from "mongoose";

export interface IColor extends Document {
  name: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const colorSchema = new Schema<IColor>(
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

export const Color = model<IColor>("colors", colorSchema);
