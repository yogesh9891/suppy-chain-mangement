import { Document, Schema, Types, model } from "mongoose";

export interface IZone extends Document {
  _id: Types.ObjectId;
  name: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const zoneSchema = new Schema<IZone>(
  {
    name: String,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Zone = model<IZone>("zones", zoneSchema);
