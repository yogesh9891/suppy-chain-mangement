import { Document, Schema, Types, model } from "mongoose";

export interface IBox extends Document {
  _id: Types.ObjectId;
  name: string;
  weight: number;
  noOfItems: number;
  itemWeight: number;
  barCode: string;
  cartonId: Types.ObjectId;
  cartonName: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const boxSchema = new Schema<IBox>(
  {
    name: String,
    barCode: String,
    weight: Number,
    itemWeight: Number,
    noOfItems: Number,
    cartonId: { type: Schema.Types.ObjectId },
    cartonName: String,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Box = model<IBox>("boxes", boxSchema);
