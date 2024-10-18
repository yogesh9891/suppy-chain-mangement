import { Document, Schema, Types, model } from "mongoose";

export interface ICity extends Document {
  _id: Types.ObjectId;
  name: string;
  countryId: Types.ObjectId;
  countryName: string;
  stateId: Types.ObjectId;
  stateName: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const citySchema = new Schema<ICity>(
  {
    name: String,
    countryId: { type: Schema.Types.ObjectId },
    countryName: String,
    stateId: { type: Schema.Types.ObjectId },
    stateName: String,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const City = model<ICity>("cities", citySchema);
