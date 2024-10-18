import { Document, Schema, Types, model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  brandId: Types.ObjectId;
  colorId: Types.ObjectId;
  sizeId: Types.ObjectId;
  categoryArr: { categoryId: Types.ObjectId }[];
  skuCode: string;
  hsnCode: string;
  barCode: string;
  packet: number;
  box: number;
  totalItemInCarton: number;
  gst: number;
  msp: number;
  attributeArr: {
    price: number;
    name: string;
    attributeValueArr: { attributeValueId: Types.ObjectId; attributeId: Types.ObjectId }[];
  }[];
  thumbnail: string;
  imagesArr: { image: string; order: number }[];
  isDeleted: boolean;
  deletedOn: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: String,
    description: String,
    gst: Number,
    msp: Number,
    brandId: Types.ObjectId,
    colorId: Types.ObjectId,
    sizeId: Types.ObjectId,
    packet: Number,
    box: Number,
    totalItemInCarton: Number,
    categoryArr: [{ categoryId: Types.ObjectId }],
    attributeArr: [
      {
        price: Number,
        name: String,
        attributeValueArr: [
          {
            attributeValueId: Types.ObjectId,
            attributeId: Types.ObjectId,
          },
        ],
      },
    ],
    skuCode: String,
    hsnCode: String,
    barCode: String,
    imagesArr: [{ image: String, order: Number }],
    thumbnail: String,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Product = model<IProduct>("products", productSchema);
