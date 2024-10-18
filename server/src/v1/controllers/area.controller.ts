import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { RequestHandler } from "express";
import { Area, IArea } from "models/area.model";
import { User } from "models/user.model";
import { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import {
  createDocuments,
  findByIdAndUpdate,
  newObjectId,
  updateMany,
  throwIfExist,
  throwIfNotExist,
} from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const AreaAdd: RequestHandler = async (req, res, next) => {
  try {
    const { name, countryId, countryName, stateId, stateName, cityId, cityName } = req.body;

    const requiredFields: any = {
      Name: name,
      Country_ID: countryId,
      Country_Name: countryName,
      State_ID: stateId,
      State_Name: stateName,
      City_ID: cityId,
      City_Name: cityName,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IArea>(
      Area,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
        cityId,
      },
      ERROR.AREA.EXIST,
    );

    const newAreaObj = {
      ...req.body,
    };

    const data: any = await createDocuments(Area, newAreaObj);

    res.status(201).json({ message: MESSAGE.AREA.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const AreaGet: RequestHandler = async (req, res, next) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };
    if (typeof req.query.countryId === "string") {
      matchObj.countryId = newObjectId(req.query.countryId);
    }
    if (typeof req.query.stateId === "string") {
      matchObj.stateId = newObjectId(req.query.stateId);
    }
    if (typeof req.query.cityId === "string") {
      matchObj.cityId = newObjectId(req.query.cityId);
    }
    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }
    let pipeline: PipelineStage[] = [
      {
        $match: matchObj,
      },
    ];

    const data = await paginateAggregate(Area, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.AREA.ALLAREAS, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const AreaGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist<IArea>(
      Area,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.AREA.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.AREA.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const AreaUpdate: RequestHandler = async (req, res, next) => {
  try {
    const area: any = await throwIfNotExist(
      Area,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.AREA.NOT_FOUND,
    );

    let findObj: any = { _id: { $ne: req.params.id }, isDeleted: false };

    if (req.body.name) findObj["name"] = newRegExp(req.body.name);

    req.body.cityId ? (findObj["cityId"] = req.body.cityId) : (findObj["cityId"] = area.cityId); //add city check as well

    await throwIfExist(Area, findObj, ERROR.AREA.EXIST);

    const data: any = await findByIdAndUpdate(Area, newObjectId(req.params.id), req.body, { new: true });

    if (req.body.name) {
      //   await updateMany(User, { areaId: req.params.id }, { areaName: req.body.name });
    }

    res.status(200).json({ message: MESSAGE.AREA.UPDATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const AreaDelete: RequestHandler = async (req, res, next) => {
  try {
    const area: any = await throwIfNotExist(
      Area,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.AREA.NOT_FOUND,
    );

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    // await throwIfExist(User, { areaId: area._id, isDeleted: false }, ERROR.AREA.CANT_DELETE);

    await findByIdAndUpdate(Area, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.AREA.REMOVED });
  } catch (error) {
    next(error);
  }
};
