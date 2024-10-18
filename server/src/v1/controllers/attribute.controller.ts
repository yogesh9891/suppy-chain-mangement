import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Attribute, IAttribute } from "models/attribute.model";
import { AttributeValue } from "models/attributeValue.model";
import { IProduct, Product } from "models/product.model";
import mongoose, { PipelineStage } from "mongoose";
import { Types } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import {
  createDocuments,
  find,
  findByIdAndUpdate,
  newObjectId,
  throwIfExist,
  throwIfNotExist,
} from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";
import attributeRouter from "v1/routes/attribute.routes";
interface AttributeResponse {
  _id?: string;
  name: string;
  label?: string;
  value?: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
  attributeValueArr?: AttributeValueResponse[];
  checked?: boolean;
}

interface AttributeValueResponse {
  _id?: string;
  name: string;
  label?: string;
  value?: string;
  attributeId: Types.ObjectId;
  attributeName: string;
  isDeleted: boolean;
  deletedOn: Date;
  checked?: boolean;
}
export const createAttribute = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "ATTRIBUTE BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IAttribute>(
      Attribute,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.ATTRIBUTE.EXIST,
    );

    const newAttributeObj = {
      ...req.body,
    };

    const newAttribute: any = await createDocuments<IAttribute>(Attribute, newAttributeObj);

    res.status(200).json({ message: MESSAGE.ATTRIBUTE.CREATED, data: newAttribute._id });
  } catch (error) {
    console.log("ERROR IN ATTRIBUTE CONTROLLER");
    next(error);
  }
};

export const getAttribute = async (req: Request, res: Response, next: NextFunction) => {
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

    const attributeArr = await paginateAggregate(Attribute, pipeline, req.query);

    res
      .status(200)
      .json({ message: MESSAGE.ATTRIBUTE.ALLATTRIBUTIES, data: attributeArr.data, total: attributeArr.total });
  } catch (error) {
    console.log("ERROR IN ATTRIBUTE CONTROLLER");
    next(error);
  }
};

export const getAttributeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attribute = await throwIfNotExist(
      Attribute,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.ATTRIBUTE.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.ATTRIBUTE.GOTBYID, data: attribute });
  } catch (error) {
    console.log("ERROR IN ATTRIBUTE CONTROLLER");
    next(error);
  }
};

export const updateAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: IAttribute = req.body;

    let attribute: any = await throwIfNotExist(
      Attribute,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.ATTRIBUTE.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Attribute,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.ATTRIBUTE.EXIST,
      );
    }

    let attributeObjToUpdate = {
      ...req.body,
    };

    const updatedAttribute = await findByIdAndUpdate<IAttribute>(
      Attribute,
      newObjectId(req.params.id),
      attributeObjToUpdate,
      {
        new: true,
      },
    );

    res.status(200).json({ message: MESSAGE.ATTRIBUTE.UPDATED, data: updatedAttribute });
  } catch (error) {
    console.log("ERROR IN ATTRIBUTE CONTROLLER");
    next(error);
  }
};

export const deleteAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attribute: IAttribute | any = await throwIfNotExist(
      Attribute,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.ATTRIBUTE.NOT_FOUND,
    );

    await throwIfExist<IProduct>(
      Product,
      { attributeId: newObjectId(attribute._id), isDeleted: false },
      ERROR.ATTRIBUTE.CANT_DELETE,
    );

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(Attribute, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.ATTRIBUTE.REMOVED });
  } catch (error) {
    console.log("ERROR IN ATTRIBUTE CONTROLLER");
    next(error);
  }
};

export const getAttributeWithValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mainAttributeArr: AttributeResponse[] | null = await find(Attribute, { isDeleted: false });

    console.log(mainAttributeArr);

    const setSubAttributeArr = async (id: string) => {
      if (!id) return [];
      const mainAttributeValueArr: AttributeValueResponse[] | null = await find(AttributeValue, {
        attributeId: id,
        isDeleted: false,
      });

      return (mainAttributeValueArr ? mainAttributeValueArr : []).map((el) => ({
        ...el,
        label: el.name,
        value: el._id,
        checked: false,
      }));
    };
    if (mainAttributeArr) {
      for (const attributeObj of mainAttributeArr) {
        attributeObj.label = attributeObj.name;
        attributeObj.value = attributeObj._id;
        attributeObj.attributeValueArr = await setSubAttributeArr(`${attributeObj._id}`);
        attributeObj.checked = false;
      }
    }

    res.status(200).json({ message: "Attribute Arr", data: mainAttributeArr, success: true });
  } catch (err) {
    next(err);
  }
};
