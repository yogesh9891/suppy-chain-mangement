import { Document, Schema, Types, model } from "mongoose";

export interface IAttributeValue extends Document {
  name: string;
  attributeId: Types.ObjectId;
  attributeName: string;
  isDeleted: boolean;
  deletedOn: Date;
}

const attributeValueSchema = new Schema<IAttributeValue>(
  {
    name: {
      type: String,
      require: true,
    },
    attributeId: Types.ObjectId,
    attributeName: String,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const AttributeValue = model<IAttributeValue>("attributeValues", attributeValueSchema);
