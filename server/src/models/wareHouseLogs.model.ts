import mongoose, { Document, Schema, Types, model } from "mongoose";
// 1. Create an interface representing a document in MongoDB.
export interface IWareHouseLogs extends Document {
  productId: Types.ObjectId;
  name: string;
  price: number;
  msp: number;
  gst: number;
  quantity: number;
  previousQuantity: number;
  currentQuantity: number;
  leftQuantity: number;
  orderedFromId: Types.ObjectId;
  orderedToId: Types.ObjectId;
  batchId: Types.ObjectId;
  status: string;
  type: string;
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const wareHouseLogsSchema = new Schema<IWareHouseLogs>(
  {
    productId: mongoose.Types.ObjectId,
    name: String,
    price: Number,
    gst: Number,
    msp: Number,
    quantity: Number,
    previousQuantity: Number,
    currentQuantity: Number,
    orderedToId: Types.ObjectId,
    orderedFromId: Types.ObjectId,
    batchId: Types.ObjectId,
    status: String,
    type: String,
  },
  { timestamps: true },
);

export const WareHouseLogs = model<IWareHouseLogs>("wareHouseLogs", wareHouseLogsSchema);
