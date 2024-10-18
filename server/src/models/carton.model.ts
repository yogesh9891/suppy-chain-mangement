import { Document, Schema, Types, model } from "mongoose";

export interface ICarton extends Document {
  _id: Types.ObjectId;
  name: string;
  weight: number;
  noOfItems: number;
  itemWeight: number;
  barCode: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const cartonSchema = new Schema<ICarton>(
  {
    name: String,
    barCode: String,
    weight: Number,
    itemWeight: Number,
    noOfItems: Number,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Carton = model<ICarton>("cartons", cartonSchema);
