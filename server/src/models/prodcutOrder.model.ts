import { Document, Schema, Types, model } from "mongoose";

export interface IProductOrder extends Document {
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
  createdAt: Date;
  updateAt: Date;
}

const productOrderSchema = new Schema<IProductOrder>(
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
  },
  { timestamps: true },
);

export const ProductOrder = model<IProductOrder>("productOrders", productOrderSchema);
