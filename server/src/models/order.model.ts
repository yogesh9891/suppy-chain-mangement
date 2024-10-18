import { Document, Schema, Types, model } from "mongoose";

export interface IOrder extends Document {
  productsArr: {
    productId: Types.ObjectId;
    barCodeType: string;
    price: number;
    gst: number;
    msp: number;
    sellingPrice: number;
    barCode: string;
    quantity: number;
    name: string;
    packet: number;
    box: number;
    totalQunatity: number;
  }[];
  sellerDetails: {
    name: string;
    storeName: string;
    gstNo: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    state: string;
    city: string;
    area: string;
    pincode: string;
    countryId: Types.ObjectId;
    stateId: Types.ObjectId;
    cityId: Types.ObjectId;
    areaId: Types.ObjectId;
  };
  buyerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    state: string;
    city: string;
    area: string;
    gstNo: string;
    pincode: string;
    countryId: Types.ObjectId;
    stateId: Types.ObjectId;
    cityId: Types.ObjectId;
    areaId: Types.ObjectId;
  };
  subTotal: number;
  totalTax: number;
  totalItem: number;
  discountValue: number;
  orderedToId: Types.ObjectId;
  orderedFromId: Types.ObjectId;
  createdBy: {
    userId: Types.ObjectId;
    name: string;
  };
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

const orderSchema = new Schema<IOrder>(
  {
    productsArr: [
      {
        productId: { type: Types.ObjectId, ref: "product" },

        barCodeType: String,
        price: Number,
        gst: Number,
        tax: Number,
        sellingPrice: Number,
        msp: Number,
        quantity: Number,
        name: String,
        barCode: String,
        packet: Number,
        box: Number,
        totalQunatity: Number,
      },
    ],
    sellerDetails: {
      name: String,
      email: String,
      storeName: String,
      gstNo: String,
      phone: String,
      address: String,
      country: String,
      state: String,
      city: String,
      area: String,
      pincode: String,
      countryId: Types.ObjectId,
      stateId: Types.ObjectId,
      cityId: Types.ObjectId,
      areaId: Types.ObjectId,
    },
    buyerDetails: {
      name: String,
      email: String,
      storeName: String,
      gstNo: String,
      phone: String,
      address: String,
      country: String,
      state: String,
      city: String,
      area: String,
      gst: String,
      pincode: String,
      countryId: Types.ObjectId,
      stateId: Types.ObjectId,
      cityId: Types.ObjectId,
      areaId: Types.ObjectId,
    },
    createdBy: {
      userId: Types.ObjectId,
      name: String,
    },
    subTotal: Number,
    totalTax: Number,
    discountValue: Number,
    orderedToId: Types.ObjectId,
    orderedFromId: Types.ObjectId,
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

export const Order = model<IOrder>("orders", orderSchema);
