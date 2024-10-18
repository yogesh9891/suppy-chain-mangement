import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { AttributeValue, IAttributeValue } from "models/attributeValue.model";
import { IProduct, Product } from "models/product.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createAttributeValue = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "ATTRIBUTE BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IAttributeValue>(
      AttributeValue,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.ATTRIBUTE.EXIST,
    );

    const newAttributeValueObj = {
      ...req.body,
    };

    const newAttributeValue: any = await createDocuments<IAttributeValue>(AttributeValue, newAttributeValueObj);

    res.status(200).json({ message: MESSAGE.ATTRIBUTE.CREATED, data: newAttributeValue._id });
  } catch (error) {
    console.log("ERROR IN ATTRIBUTE CONTROLLER");
    next(error);
  }
};

export const getAttributeValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }
    if (req.query.attributeId) {
      matchObj.attributeId = new mongoose.Types.ObjectId(`${req.query.attributeId}`);
    }

    let pipeline: PipelineStage[] = [
      {
        $match: matchObj,
      },
    ];

    const attributeValueArr = await paginateAggregate(AttributeValue, pipeline, req.query);

    res.status(200).json({
      message: MESSAGE.ATTRIBUTE.ALLATTRIBUTIES,
      data: attributeValueArr.data,
      total: attributeValueArr.total,
    });
  } catch (error) {
    console.log("ERROR IN ATTRIBUTE CONTROLLER");
    next(error);
  }
};

export const getAttributeValueById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attributeValue = await throwIfNotExist(
      AttributeValue,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.ATTRIBUTE.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.ATTRIBUTE.GOTBYID, data: attributeValue });
  } catch (error) {
    console.log("ERROR IN ATTRIBUTE CONTROLLER");
    next(error);
  }
};

export const updateAttributeValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name }: IAttributeValue = req.body;

    let attributeValue: any = await throwIfNotExist(
      AttributeValue,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.ATTRIBUTE.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        AttributeValue,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.ATTRIBUTE.EXIST,
      );
    }

    let attributeValueObjToUpdate = {
      ...req.body,
    };

    const updatedAttributeValue = await findByIdAndUpdate<IAttributeValue>(
      AttributeValue,
      newObjectId(req.params.id),
      attributeValueObjToUpdate,
      {
        new: true,
      },
    );

    res.status(200).json({ message: MESSAGE.ATTRIBUTE.UPDATED, data: updatedAttributeValue });
  } catch (error) {
    console.log("ERROR IN ATTRIBUTE CONTROLLER");
    next(error);
  }
};

export const deleteAttributeValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attributeValue: IAttributeValue | any = await throwIfNotExist(
      AttributeValue,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.ATTRIBUTE.NOT_FOUND,
    );

    await throwIfExist<IProduct>(
      Product,
      { attributeValueId: newObjectId(attributeValue._id), isDeleted: false },
      ERROR.ATTRIBUTE.CANT_DELETE,
    );

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(AttributeValue, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.ATTRIBUTE.REMOVED });
  } catch (error) {
    console.log("ERROR IN ATTRIBUTE CONTROLLER");
    next(error);
  }
};
