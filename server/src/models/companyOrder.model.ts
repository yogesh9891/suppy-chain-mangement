import { Document, Schema, Types, model } from "mongoose";

export interface ICompanyOrder extends Document {
  productsArr: {
    productId: Types.ObjectId;
    price: number;
    msp: number;
    gst: number;
    barCode: string;
    totalItemInCarton: number;
    box: number;
    packet: number;
    quantity: number;
    totalTax: number;
    name: string;
    status: String;
  }[];
  subTotal: number;
  totalItem: number;
  totalTax: number;
  discountValue: number;
  orderedToId: Types.ObjectId;
  orderedFromId: Types.ObjectId;
  total: number;
  orderStatus: {
    currentStatus: string;
    on: Date;
  };
  statusArr: {
    status: String;
    on: Date;
  }[];
  reason: String;
  name: String;
  createdAt: Date;
  updateAt: Date;
}

const companyOrderSchema = new Schema<ICompanyOrder>(
  {
    productsArr: [
      {
        productId: { type: Types.ObjectId, ref: "product" },
        price: Number,
        msp: Number,
        gst: Number,
        quantity: Number,
        name: String,
        barCode: String,
        totalItemInCarton: Number,
        box: Number,
        packet: Number,
        status: { type: String, default: "PENDING" },
      },
    ],
    subTotal: Number,
    totalItem: Number,
    discountValue: Number,
    orderedFromId: Types.ObjectId,
    orderedToId: Types.ObjectId,
    total: Number,
    orderStatus: {
      currentStatus: String,
      on: Date,
    },
    statusArr: [
      {
        status: String,
        on: Date,
      },
    ],
    reason: String,
    name: String,
  },
  { timestamps: true },
);

export const CompanyOrder = model<ICompanyOrder>("companyOrders", companyOrderSchema);
