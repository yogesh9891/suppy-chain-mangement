import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Size, ISize } from "models/size.model";
import { IProduct, Product } from "models/product.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createSize = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "SIZE BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<ISize>(
      Size,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.SIZE.EXIST,
    );

    const newSizeObj = {
      ...req.body,
    };

    if (thumbnail && typeof thumbnail === "string") {
      newSizeObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newSize: any = await createDocuments<ISize>(Size, newSizeObj);

    res.status(200).json({ message: MESSAGE.SIZE.CREATED, data: newSize._id });
  } catch (error) {
    console.log("ERROR IN SIZE CONTROLLER");
    next(error);
  }
};

export const getSize = async (req: Request, res: Response, next: NextFunction) => {
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

    const sizeArr = await paginateAggregate(Size, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.SIZE.ALLSIZES, data: sizeArr.data, total: sizeArr.total });
  } catch (error) {
    console.log("ERROR IN SIZE CONTROLLER");
    next(error);
  }
};

export const getSizeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const size = await throwIfNotExist(
      Size,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.SIZE.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.SIZE.GOTBYID, data: size });
  } catch (error) {
    console.log("ERROR IN SIZE CONTROLLER");
    next(error);
  }
};

export const updateSize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: ISize = req.body;

    let size: any = await throwIfNotExist(
      Size,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.SIZE.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Size,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.SIZE.EXIST,
      );
    }

    let sizeObjToUpdate = {
      ...req.body,
    };

    if (thumbnail) {
      sizeObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const updatedSize = await findByIdAndUpdate<ISize>(Size, newObjectId(req.params.id), sizeObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.SIZE.UPDATED, data: updatedSize });
  } catch (error) {
    console.log("ERROR IN SIZE CONTROLLER");
    next(error);
  }
};

export const deleteSize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const size: ISize | any = await throwIfNotExist(
      Size,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.SIZE.NOT_FOUND,
    );

    await throwIfExist<IProduct>(Product, { sizeId: newObjectId(size._id), isDeleted: false }, ERROR.SIZE.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(Size, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.SIZE.REMOVED });
  } catch (error) {
    console.log("ERROR IN SIZE CONTROLLER");
    next(error);
  }
};
