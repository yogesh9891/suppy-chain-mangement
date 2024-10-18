import { Document, Schema, Types, model } from "mongoose";

export interface IxpenseCategory extends Document {
  name: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const expenseCategorySchema = new Schema<IxpenseCategory>(
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

export const xpenseCategory = model<IxpenseCategory>("expenseCategorys", expenseCategorySchema);
