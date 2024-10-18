import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Color, IColor } from "models/color.model";
import { IProduct, Product } from "models/product.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createColor = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "COLOR BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IColor>(
      Color,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.COLOR.EXIST,
    );

    const newColorObj = {
      ...req.body,
    };

    if (thumbnail && typeof thumbnail === "string") {
      newColorObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newColor: any = await createDocuments<IColor>(Color, newColorObj);

    res.status(200).json({ message: MESSAGE.COLOR.CREATED, data: newColor._id });
  } catch (error) {
    console.log("ERROR IN COLOR CONTROLLER");
    next(error);
  }
};

export const getColor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    let pipeline: PipelineStage[] = [
      {
        $match: matchObj,
      },
    ];

    const colorArr = await paginateAggregate(Color, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.COLOR.ALLCOLORS, data: colorArr.data, total: colorArr.total });
  } catch (error) {
    console.log("ERROR IN COLOR CONTROLLER");
    next(error);
  }
};

export const getColorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const color = await throwIfNotExist(
      Color,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.COLOR.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.COLOR.GOTBYID, data: color });
  } catch (error) {
    console.log("ERROR IN COLOR CONTROLLER");
    next(error);
  }
};

export const updateColor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: IColor = req.body;

    let color: any = await throwIfNotExist(
      Color,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.COLOR.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Color,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.COLOR.EXIST,
      );
    }

    let colorObjToUpdate = {
      ...req.body,
    };

    if (thumbnail) {
      colorObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const updatedColor = await findByIdAndUpdate<IColor>(Color, newObjectId(req.params.id), colorObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.COLOR.UPDATED, data: updatedColor });
  } catch (error) {
    console.log("ERROR IN COLOR CONTROLLER");
    next(error);
  }
};

export const deleteColor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const color: IColor | any = await throwIfNotExist(
      Color,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.COLOR.NOT_FOUND,
    );

    await throwIfExist<IProduct>(
      Product,
      { colorId: newObjectId(color._id), isDeleted: false },
      ERROR.COLOR.CANT_DELETE,
    );

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(Color, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.COLOR.REMOVED });
  } catch (error) {
    console.log("ERROR IN COLOR CONTROLLER");
    next(error);
  }
};
