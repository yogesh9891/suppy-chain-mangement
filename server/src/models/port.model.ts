import { Document, Schema, Types, model } from "mongoose";

export interface IPort extends Document {
  name: string;
  address: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const portSchema = new Schema<IPort>(
  {
    name: {
      type: String,
      require: true,
    },
    thumbnail: String,
    address: String,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Port = model<IPort>("ports", portSchema);
