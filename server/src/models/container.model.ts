import { LOAD_TYPE } from "common/constant.common";
import { Document, Schema, Types, model } from "mongoose";

export interface IContainer extends Document {
  productsArr: {
    productId: Types.ObjectId;
    totalItemInCarton: number;
    box: number;
    packet: number;
    quantity: number;
    name: string;
    status: String;
  }[];
  totalItem: number;
  name: string;
  portId: Types.ObjectId;
  portName: string;
  orderedToId: Types.ObjectId;
  orderedFromId: Types.ObjectId;
  orderStatus: {
    currentStatus: string;
    on: Date;
  };
  statusArr: {
    status: String;
    on: Date;
  }[];
  reason: String;
  type: String;
  createdAt: Date;
  updateAt: Date;
}

const containerSchema = new Schema<IContainer>(
  {
    productsArr: [
      {
        productId: { type: Types.ObjectId, ref: "product" },
        price: Number,
        name: String,
        totalItemInCarton: Number,
        box: Number,
        packet: Number,
        quantity: Number,
        status: { type: String, default: "PENDING" },
        type: { type: String, default: LOAD_TYPE.CONTAINER },
      },
    ],
    totalItem: Number,
    name: String,
    portId: Types.ObjectId,
    portName: String,
    orderedFromId: Types.ObjectId,
    orderedToId: Types.ObjectId,
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
    type: { type: String, default: LOAD_TYPE.CONTAINER },
  },
  { timestamps: true },
);

export const Container = model<IContainer>("containers", containerSchema);
