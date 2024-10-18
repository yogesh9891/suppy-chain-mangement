import { Document, Schema, Types, model } from "mongoose";

export interface IArea extends Document {
  _id: Types.ObjectId;
  name: string;
  countryId: Types.ObjectId;
  countryName: string;
  stateId: Types.ObjectId;
  stateName: string;
  cityId: Types.ObjectId;
  cityName: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const areaSchema = new Schema<IArea>(
  {
    name: String,
    countryId: { type: Schema.Types.ObjectId },
    countryName: String,
    stateId: { type: Schema.Types.ObjectId },
    stateName: String,
    cityId: { type: Schema.Types.ObjectId },
    cityName: String,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Area = model<IArea>("areas", areaSchema);
