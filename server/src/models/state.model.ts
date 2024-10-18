import { Document, Schema, Types, model } from "mongoose";

export interface IState extends Document {
  _id: Types.ObjectId;
  name: string;
  countryId: Types.ObjectId;
  countryName: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const stateSchema = new Schema<IState>(
  {
    name: String,
    countryId: { type: Schema.Types.ObjectId },
    countryName: String,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const State = model<IState>("states", stateSchema);
