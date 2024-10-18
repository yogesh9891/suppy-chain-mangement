import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Port, IPort } from "models/port.model";
import { IProduct, Product } from "models/product.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createPort = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "COLOR BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IPort>(
      Port,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.COLOR.EXIST,
    );

    const newPortObj = {
      ...req.body,
    };

    if (thumbnail && typeof thumbnail === "string") {
      newPortObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newPort: any = await createDocuments<IPort>(Port, newPortObj);

    res.status(200).json({ message: MESSAGE.COLOR.CREATED, data: newPort._id });
  } catch (error) {
    console.log("ERROR IN COLOR CONTROLLER");
    next(error);
  }
};

export const getPort = async (req: Request, res: Response, next: NextFunction) => {
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

    const portArr = await paginateAggregate(Port, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.COLOR.ALLCOLORS, data: portArr.data, total: portArr.total });
  } catch (error) {
    console.log("ERROR IN COLOR CONTROLLER");
    next(error);
  }
};

export const getPortById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const port = await throwIfNotExist(
      Port,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.COLOR.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.COLOR.GOTBYID, data: port });
  } catch (error) {
    console.log("ERROR IN COLOR CONTROLLER");
    next(error);
  }
};

export const updatePort = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: IPort = req.body;

    let port: any = await throwIfNotExist(
      Port,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.COLOR.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Port,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.COLOR.EXIST,
      );
    }

    let portObjToUpdate = {
      ...req.body,
    };

    if (thumbnail) {
      portObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const updatedPort = await findByIdAndUpdate<IPort>(Port, newObjectId(req.params.id), portObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.COLOR.UPDATED, data: updatedPort });
  } catch (error) {
    console.log("ERROR IN COLOR CONTROLLER");
    next(error);
  }
};

export const deletePort = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const port: IPort | any = await throwIfNotExist(
      Port,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.COLOR.NOT_FOUND,
    );

    await throwIfExist<IProduct>(
      Product,
      { portId: newObjectId(port._id), isDeleted: false },
      ERROR.COLOR.CANT_DELETE,
    );

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(Port, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.COLOR.REMOVED });
  } catch (error) {
    console.log("ERROR IN COLOR CONTROLLER");
    next(error);
  }
};
