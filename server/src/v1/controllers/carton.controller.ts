import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { RequestHandler } from "express";
import { Area } from "models/area.model";
import { City } from "models/city.model";
import { Carton, ICarton } from "models/carton.model";
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

export const CartonAdd: RequestHandler = async (req, res, next) => {
  try {
    const { name, weight, itemWeight, noOfItems } = req.body;

    const requiredFields = { Name: name };

    verifyRequiredFields(requiredFields);

    await throwIfExist<ICarton>(
      Carton,
      {
        name: newRegExp(name),
        isDeleted: false,
      },
      ERROR.CARTON.EXIST,
    );

    // let barCode = generateBarCodeWithValue(`${req.body.name}${weight}${itemWeight}${noOfItems}`);
    const newCartonObj = {
      ...req.body,
    };

    const data: any = await createDocuments(Carton, newCartonObj);

    res.status(201).json({ message: MESSAGE.CARTON.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const CartonGet: RequestHandler = async (req, res, next) => {
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

    const data = await paginateAggregate(Carton, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.CARTON.ALLCARTONS, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const CartonGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist(
      Carton,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.CARTON.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.CARTON.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const CartonUpdate: RequestHandler = async (req, res, next) => {
  try {
    await throwIfNotExist(Carton, { _id: newObjectId(req.params.id), isDeleted: false }, ERROR.CARTON.NOT_FOUND);

    if (req.body.name) {
      await throwIfExist(
        Carton,
        {
          _id: { $ne: newObjectId(req.params.id) },
          name: newRegExp(req.body.name),
          isDeleted: false,
        },
        ERROR.CARTON.EXIST,
      );
    }
    const data: ICarton | any = await findByIdAndUpdate<ICarton>(Carton, newObjectId(req.params.id), req.body);

    res.status(200).json({ message: MESSAGE.CARTON.UPDATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const CartonDelete: RequestHandler = async (req, res, next) => {
  try {
    const carton: any = await throwIfNotExist<ICarton>(
      Carton,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.CARTON.NOT_FOUND,
    );

    await throwIfExist<IState>(State, { cartonId: carton?._id, isDeleted: false }, ERROR.CARTON.CANT_DELETE);
    // await throwIfExist<IUser>(User, { cartonId: carton?._id, isDeleted: false }, ERROR.CARTON.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(Carton, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.CARTON.REMOVED });
  } catch (error) {
    next(error);
  }
};
