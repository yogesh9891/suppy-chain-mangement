import { Document, Schema, Types, model } from "mongoose";

export interface IExpense extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  expenseCategoryId: Types.ObjectId;
  expenseCategoryName: string;
  description: string;
  amount: number;
  isDeleted: boolean;
  deletedOn: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    description: String,
    userId: Types.ObjectId,
    expenseCategoryId: Types.ObjectId,
    expenseCategoryName: String,
    amount: Number,
    isDeleted: { type: Boolean, default: false },
    deletedOn: Date,
  },
  { timestamps: true },
);

export const Expense = model<IExpense>("expenses", expenseSchema);
