import { Document, Schema, Types, model } from "mongoose";

export interface IBarCode extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  name: string;
  barCodeType: string;
  barCode: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const barcodeSchema = new Schema<IBarCode>(
  {
    barCodeType: String,
    name: String,
    productId: Types.ObjectId,
    barCode: String,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const BarCode = model<IBarCode>("barcodes", barcodeSchema);
