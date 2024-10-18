import mongoose, { Document, Schema, Types, model } from "mongoose";
// 1. Create an interface representing a document in MongoDB.
export interface IProductStock extends Document {
  productId: mongoose.Types.ObjectId,
  brandId: Types.ObjectId;
  colorId: Types.ObjectId;
  sizeId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  msp: number;
  gst: number;
  totalItemInCarton: number;
  packet: number;
  box: number;
  minStock: number;
  totalItems: number;
  leftItems: number;
  orderedFromId: Types.ObjectId;
  orderedToId: Types.ObjectId;
  type: string;
  batchId: Types.ObjectId;
  isSold: boolean;
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const productStockSchema = new Schema<IProductStock>(
  {
    productId: mongoose.Types.ObjectId,
     brandId: mongoose.Types.ObjectId,
      colorId: mongoose.Types.ObjectId,
    sizeId: mongoose.Types.ObjectId,
    name: String,
    type: String,
    price: Number,
    quantity: Number,
    gst: Number,
    msp: Number,
    minStock: Number,
    totalItemInCarton: Number,
    box: Number,
    packet: Number,
    totalItems: Number,
    leftItems: Number,
    isSold: Boolean, // 1 for stock is sold
    orderedToId: Types.ObjectId,
    orderedFromId: Types.ObjectId,
    batchId: Types.ObjectId,
  },
  { timestamps: true },
);

export const ProductStock = model<IProductStock>("productStock", productStockSchema);
