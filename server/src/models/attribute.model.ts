import { Document, Schema, Types, model } from "mongoose";

export interface IAttribute extends Document {
  name: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const attributeSchema = new Schema<IAttribute>(
  {
    name: {
      type: String,
      require: true,
    },
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Attribute = model<IAttribute>("attributes", attributeSchema);
