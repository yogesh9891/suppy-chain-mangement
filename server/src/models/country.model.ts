import { Document, Schema, Types, model } from "mongoose";

export interface ICountry extends Document {
  _id: Types.ObjectId;
  name: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const countrySchema = new Schema<ICountry>(
  {
    name: String,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Country = model<ICountry>("countries", countrySchema);
