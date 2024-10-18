import { Document, Schema, Types, model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  imagesArr: { image: string }[];
  thumbnail: string;
  parentCategoryId: string;
  parentCategoryArr: { _id?: Types.ObjectId; categoryId: string | Types.ObjectId }[];
  level: number;
  isDeleted: boolean;
  deletedOn: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    imagesArr: [
      {
        image: String,
      },
    ],
    thumbnail: String,
    parentCategoryId: Types.ObjectId,
    parentCategoryArr: [
      {
        categoryId: Types.ObjectId,
      },
    ],

    level: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Category = model<ICategory>("categories", categorySchema);
