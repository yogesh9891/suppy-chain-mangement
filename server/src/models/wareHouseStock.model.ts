import mongoose, { Document, Schema, Types, model } from "mongoose";
// 1. Create an interface representing a document in MongoDB.
export interface IWareHouseStock extends Document {
  productId: Types.ObjectId;
  brandId: Types.ObjectId;
  colorId: Types.ObjectId;
  sizeId: Types.ObjectId;
  name: string;
  price: number;
  msp: number;
  gst: number;
  quantity: number;
  orderedFromId: Types.ObjectId;
  orderedToId: Types.ObjectId;
  status: string;
  type: string;
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const wareHouseStockSchema = new Schema<IWareHouseStock>(
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
    orderedToId: Types.ObjectId,
    orderedFromId: Types.ObjectId,
    status: String,
    type: String,
  },
  { timestamps: true },
);

export const WareHouseStock = model<IWareHouseStock>("wareHouseStock", wareHouseStockSchema);
