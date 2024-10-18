import { ROLES, ROLES_TYPE } from "common/constant.common";
import mongoose, { Document, Schema, Types, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  countryId: Types.ObjectId;
  countryName: string;
  stateId: Types.ObjectId;
  stateName: string;
  cityId: Types.ObjectId;
  cityName: string;
  areaId: Types.ObjectId;
  zoneId: Types.ObjectId;
  zoneName: string;
  storeId: Types.ObjectId;
  storeName: string;
  areaName: string;
  address: string;
  pincode: string;
  isVerified: boolean;
  status: string;
  profileImage: string;
  gstNo: string;
  role: ROLES_TYPE;
  isDeleted: boolean;
  deletedOn: Date;
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const usersSchema = new Schema<IUser>(
  {
    name: String,
    email: String,
    phone: String,
    password: String,
    profileImage: String,
    countryId: Types.ObjectId,
    countryName: String,
    stateId: Types.ObjectId,
    stateName: String,
    cityId: Types.ObjectId,
    cityName: String,
    areaId: Types.ObjectId,
    areaName: String,
    zoneId: Types.ObjectId,
    zoneName: String,
    storeId: Types.ObjectId,
    pincode: String,
    storeName: String,
    address: String,
    gstNo: String,
    role: {
      type: String,
      default: ROLES.USER,
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    status: String,
    // And `Schema.Types.ObjectId` in the schema definition.
  },
  { timestamps: true },
);

export const User = model<IUser>("users", usersSchema);