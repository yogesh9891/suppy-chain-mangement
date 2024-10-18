import mongoose, { Document, Schema, Types, model } from "mongoose";
// 1. Create an interface representing a document in MongoDB.
export interface IProductStockLogs extends Document {
  productId: Types.ObjectId;
  brandId: Types.ObjectId;
  colorId: Types.ObjectId;
  sizeId: Types.ObjectId;
  name: string;
  price: number;
  msp: number;
  gst: number;
  quantity: number;
  packet: number;
  box: number;
  minStock: number;
  totalItems: number;
  leftItems: number;
  orderedFromId: Types.ObjectId;
  orderedToId: Types.ObjectId;
  batchId: Types.ObjectId;
  isSold: boolean;
  status: string;
  type: string;
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const productStockLogsSchema = new Schema<IProductStockLogs>(
  {
    productId: mongoose.Types.ObjectId,
    brandId: mongoose.Types.ObjectId,
    colorId: mongoose.Types.ObjectId,
    sizeId: mongoose.Types.ObjectId,
    name: String,
    price: Number,
    gst: Number,
    msp: Number,
    quantity: Number,
    minStock: Number,
    box: Number,
    packet: Number,
    totalItems: Number,
    leftItems: Number,
    isSold: Boolean, // 1 for stock is sold
    orderedToId: Types.ObjectId,
    orderedFromId: Types.ObjectId,
    batchId: Types.ObjectId,
    status: String,
    type: String,
  },
  { timestamps: true },
);

export const ProductStockLogs = model<IProductStockLogs>("productStockLogs", productStockLogsSchema);
