import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { RequestHandler } from "express";
import { Area } from "models/area.model";
import { City } from "models/city.model";
import { Expense, IExpense } from "models/expense.model";
import { IState, State } from "models/state.model";
import { IUser, User } from "models/user.model";
import { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import {
  createDocuments,
  findByIdAndUpdate,
  newObjectId,
  throwIfExist,
  throwIfNotExist,
  updateMany,
} from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";
import { generateBarCodeWithValue } from "helpers/barCode";

export const ExpenseAdd: RequestHandler = async (req, res, next) => {
  try {
    // const requiredFields = { Name: name };

    // verifyRequiredFields(requiredFields);

    // await throwIfExist<IExpense>(
    //   Expense,
    //   {
    //     name: newRegExp(name),
    //     isDeleted: false,
    //   },
    //   ERROR.CARTON.EXIST,
    // );
    let userId = req.user?.userId;
    console.log(req.user);
    const newExpenseObj = {
      userId,
      ...req.body,
    };

    console.log(newExpenseObj, "userIduserIduserIduserIduserIduserId");

    const data: any = await createDocuments(Expense, newExpenseObj);

    res.status(201).json({ message: MESSAGE.CARTON.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const ExpenseGet: RequestHandler = async (req, res, next) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }
    matchObj.userId = req.user?.userObj?._id;

    let pipeline: PipelineStage[] = [
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: matchObj,
      },
    ];

    const data = await paginateAggregate(Expense, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.CARTON.ALLCARTONS, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const ExpenseGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist(
      Expense,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.CARTON.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.CARTON.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const ExpenseUpdate: RequestHandler = async (req, res, next) => {
  try {
    await throwIfNotExist(Expense, { _id: newObjectId(req.params.id), isDeleted: false }, ERROR.CARTON.NOT_FOUND);

    // if (req.body.name) {
    //   await throwIfExist(
    //     Expense,
    //     {
    //       _id: { $ne: newObjectId(req.params.id) },
    //       name: newRegExp(req.body.name),
    //       isDeleted: false,
    //     },
    //     ERROR.CARTON.EXIST,
    //   );
    // }
    const data: IExpense | any = await findByIdAndUpdate<IExpense>(Expense, newObjectId(req.params.id), req.body);

    res.status(200).json({ message: MESSAGE.CARTON.UPDATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const ExpenseDelete: RequestHandler = async (req, res, next) => {
  try {
    const expense: any = await throwIfNotExist<IExpense>(
      Expense,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.CARTON.NOT_FOUND,
    );

    await throwIfExist<IState>(State, { expenseId: expense?._id, isDeleted: false }, ERROR.CARTON.CANT_DELETE);
    // await throwIfExist<IUser>(User, { expenseId: expense?._id, isDeleted: false }, ERROR.CARTON.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(Expense, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.CARTON.REMOVED });
  } catch (error) {
    next(error);
  }
};
