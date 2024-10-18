import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Brand, IBrand } from "models/brand.model";
import { IProduct, Product } from "models/product.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createBrand = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "BRAND BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IBrand>(
      Brand,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.BRAND.EXIST,
    );

    const newBrandObj = {
      ...req.body,
    };

    if (thumbnail && typeof thumbnail === "string") {
      newBrandObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newBrand: any = await createDocuments<IBrand>(Brand, newBrandObj);

    res.status(200).json({ message: MESSAGE.BRAND.CREATED, data: newBrand._id });
  } catch (error) {
    console.log("ERROR IN BRAND CONTROLLER");
    next(error);
  }
};

export const getBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

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

    const brandArr = await paginateAggregate(Brand, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.BRAND.ALLBRANDS, data: brandArr.data, total: brandArr.total });
  } catch (error) {
    console.log("ERROR IN BRAND CONTROLLER");
    next(error);
  }
};

export const getBrandById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await throwIfNotExist(
      Brand,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.BRAND.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.BRAND.GOTBYID, data: brand });
  } catch (error) {
    console.log("ERROR IN BRAND CONTROLLER");
    next(error);
  }
};

export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: IBrand = req.body;

    let brand: any = await throwIfNotExist(
      Brand,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.BRAND.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Brand,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.BRAND.EXIST,
      );
    }

    let brandObjToUpdate = {
      ...req.body,
    };

    if (thumbnail) {
      brandObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const updatedBrand = await findByIdAndUpdate<IBrand>(Brand, newObjectId(req.params.id), brandObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.BRAND.UPDATED, data: updatedBrand });
  } catch (error) {
    console.log("ERROR IN BRAND CONTROLLER");
    next(error);
  }
};

export const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand: IBrand | any = await throwIfNotExist(
      Brand,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.BRAND.NOT_FOUND,
    );

    await throwIfExist<IProduct>(
      Product,
      { brandId: newObjectId(brand._id), isDeleted: false },
      ERROR.BRAND.CANT_DELETE,
    );

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(Brand, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.BRAND.REMOVED });
  } catch (error) {
    console.log("ERROR IN BRAND CONTROLLER");
    next(error);
  }
};
