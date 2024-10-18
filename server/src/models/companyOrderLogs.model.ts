import mongoose, { Document, Schema, Types, model } from "mongoose";
// 1. Create an interface representing a document in MongoDB.
export interface ICompanyOrderLogs extends Document {
  productId: Types.ObjectId;
  brandId: Types.ObjectId;
  colorId: Types.ObjectId;
  sizeId: Types.ObjectId;
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
const companyOrderLogsSchema = new Schema<ICompanyOrderLogs>(
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
    previousQuantity: Number,
    currentQuantity: Number,
    leftQuantity: Number,
    orderedToId: Types.ObjectId,
    orderedFromId: Types.ObjectId,
    batchId: Types.ObjectId,
    status: String,
    type: String,
  },
  { timestamps: true },
);

export const CompanyOrderLogs = model<ICompanyOrderLogs>("companyOrderLogs", companyOrderLogsSchema);
