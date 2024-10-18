import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { RequestHandler } from "express";
import { City } from "models/city.model";
import { IBox, Box } from "models/box.model";
import { User } from "models/user.model";
import mongoose, { PipelineStage } from "mongoose";
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

export const BoxAdd: RequestHandler = async (req, res, next) => {
  try {
    const { name, cartonId, cartonName, weight, itemWeight, noOfItems } = req.body;

    const requiredFields: any = {
      Name: name,
      Carton_ID: cartonId,
      Carton_Name: cartonName,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IBox>(
      Box,
      {
        name: newRegExp(req.body.name),
        cartonId,
        isDeleted: false,
      },
      ERROR.STATE.EXIST,
    );
    const data: any = await createDocuments<IBox>(Box, req.body);

    res.status(201).json({ message: MESSAGE.STATE.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const BoxGet: RequestHandler = async (req, res, next) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (typeof req.query.cartonId === "string") {
      matchObj.cartonId = new mongoose.Types.ObjectId(req.query.cartonId);
    }

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

    const data = await paginateAggregate(Box, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.STATE.ALLSTATES, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const BoxGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist(
      Box,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.STATE.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.STATE.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const BoxUpdate: RequestHandler = async (req, res, next) => {
  try {
    const regionData: IBox | any = await throwIfNotExist<IBox>(
      Box,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.STATE.NOT_FOUND,
    );

    if (req.body.name) {
      await throwIfExist(
        Box,
        {
          _id: { $ne: req.params.id },
          cartonId: req.body.cartonId ? newObjectId(req.body.cartonId) : newObjectId(regionData?.cartonId),
          name: newRegExp(req.body.name),
        },
        ERROR.STATE.EXIST,
      );
    }

    const data = await findByIdAndUpdate<IBox>(Box, newObjectId(req.params.id), req.body);

    if (typeof req.body.name === "string") {
      await updateMany(Box, { regionId: req.params.id }, { regionName: req.body.name });
      await updateMany(City, { regionId: req.params.id }, { regionName: req.body.name });
      await updateMany(Box, { regionId: req.params.id }, { regionName: req.body.name });
      //   await updateMany(User, { regionId: req.params.id }, { regionName: req.body.name });
    }

    res.status(200).json({ message: MESSAGE.STATE.ALLSTATES, data: data?._id });
  } catch (error) {
    next(error);
  }
};

export const BoxDelete: RequestHandler = async (req, res, next) => {
  try {
    const region = await throwIfNotExist<IBox>(
      Box,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.STATE.NOT_FOUND,
    );

    await throwIfExist(Box, { regionId: newObjectId(region?._id), isDeleted: false }, ERROR.STATE.CANT_DELETE);
    // await throwIfExist(User, { regionId: newObjectId(region?._id), isDeleted: false }, ERROR.STATE.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate<IBox>(Box, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.STATE.REMOVED });
  } catch (error) {
    next(error);
  }
};
