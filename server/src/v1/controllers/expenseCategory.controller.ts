import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { xpenseCategory, IxpenseCategory } from "models/expenseCategory.model";
import { IProduct, Product } from "models/product.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createxpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "BRAND BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IxpenseCategory>(
      xpenseCategory,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.BRAND.EXIST,
    );

    const newxpenseCategoryObj = {
      ...req.body,
    };

    if (thumbnail && typeof thumbnail === "string") {
      newxpenseCategoryObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newxpenseCategory: any = await createDocuments<IxpenseCategory>(xpenseCategory, newxpenseCategoryObj);

    res.status(200).json({ message: MESSAGE.BRAND.CREATED, data: newxpenseCategory._id });
  } catch (error) {
    console.log("ERROR IN BRAND CONTROLLER");
    next(error);
  }
};

export const getxpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    let pipeline: PipelineStage[] = [
      {
        $sort: {
          createdAt:-1
        }
      },
      {
        $match: matchObj,
      },
    ];

    const expenseCategoryArr = await paginateAggregate(xpenseCategory, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.BRAND.ALLBRANDS, data: expenseCategoryArr.data, total: expenseCategoryArr.total });
  } catch (error) {
    console.log("ERROR IN BRAND CONTROLLER");
    next(error);
  }
};

export const getxpenseCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenseCategory = await throwIfNotExist(
      xpenseCategory,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.BRAND.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.BRAND.GOTBYID, data: expenseCategory });
  } catch (error) {
    console.log("ERROR IN BRAND CONTROLLER");
    next(error);
  }
};

export const updatexpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: IxpenseCategory = req.body;

    let expenseCategory: any = await throwIfNotExist(
      xpenseCategory,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.BRAND.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        xpenseCategory,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.BRAND.EXIST,
      );
    }

    let expenseCategoryObjToUpdate = {
      ...req.body,
    };

    if (thumbnail) {
      expenseCategoryObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const updatedxpenseCategory = await findByIdAndUpdate<IxpenseCategory>(xpenseCategory, newObjectId(req.params.id), expenseCategoryObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.BRAND.UPDATED, data: updatedxpenseCategory });
  } catch (error) {
    console.log("ERROR IN BRAND CONTROLLER");
    next(error);
  }
};

export const deletexpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenseCategory: IxpenseCategory | any = await throwIfNotExist(
      xpenseCategory,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.BRAND.NOT_FOUND,
    );

    await throwIfExist<IProduct>(
      Product,
      { expenseCategoryId: newObjectId(expenseCategory._id), isDeleted: false },
      ERROR.BRAND.CANT_DELETE,
    );

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(xpenseCategory, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.BRAND.REMOVED });
  } catch (error) {
    console.log("ERROR IN BRAND CONTROLLER");
    next(error);
  }
};
