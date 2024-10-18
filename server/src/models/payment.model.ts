import { Document, Schema, Types, model } from "mongoose";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  storeId: Types.ObjectId;
  createdBy: Types.ObjectId;
  amount: number;
  description: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const barcodeSchema = new Schema<IPayment>(
  {
    userId: Types.ObjectId,
    storeId: Types.ObjectId,
    createdBy: Types.ObjectId,
    amount: Number,
    description: String,
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Payment = model<IPayment>("payment", barcodeSchema);
