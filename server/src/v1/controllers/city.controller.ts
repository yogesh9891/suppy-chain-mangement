import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { RequestHandler } from "express";
import { IArea, Area } from "models/area.model";
import { ICity, City } from "models/city.model";
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
import { escapeRegExp, newRegExp } from "utils/regex";

export const CityAdd: RequestHandler = async (req, res, next) => {
  try {
    const { name, countryId, countryName, stateId, stateName }: ICity = req.body;

    const requiredFields: any = {
      Name: name,
      Country_ID: countryId,
      Country_Name: countryName,
      State_ID: stateId,
      State_Name: stateName,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<ICity>(
      City,
      {
        name: newRegExp(req.body.name),
        stateId: stateId,
        isDeleted: false,
      },
      ERROR.CITY.EXIST,
    );

    const newCityObj = {
      ...req.body,
    };

    const data: any = await createDocuments(City, newCityObj);

    res.status(201).json({ message: MESSAGE.CITY.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const CityGet: RequestHandler = async (req, res, next) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (typeof req.query.countryId === "string") {
      matchObj.countryId = newObjectId(req.query.countryId);
    }
    if (typeof req.query.regionId === "string") {
      matchObj.regionId = newObjectId(req.query.regionId);
    }
    if (typeof req.query.stateId === "string") {
      matchObj.stateId = newObjectId(req.query.stateId);
    }
    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    let pipeline: PipelineStage[] = [
      {
        $match: matchObj,
      },
    ];

    const data = await paginateAggregate(City, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.CITY.ALLCITIES, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const CityGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist<ICity>(
      City,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.CITY.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.CITY.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const CityUpdate: RequestHandler = async (req, res, next) => {
  try {
    const city: any = await throwIfNotExist<ICity>(
      City,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.CITY.NOT_FOUND,
    );

    if (req.body.name) {
      await throwIfExist<ICity>(
        City,
        {
          _id: { $ne: newObjectId(req.params.id) },
          stateId: newObjectId(city.stateId),
          isDeleted: false,
          name: newRegExp(req.body.name),
        },
        ERROR.CITY.EXIST,
      );
    }

    await City.findByIdAndUpdate(newObjectId(req.params.id), req.body);

    if (typeof req.body.name === "string") {
      await updateMany<IArea>(Area, { cityId: req.params.id }, { cityName: req.body.name });
      //   await updateMany<IUser>(User, { cityId: req.params.id }, { cityName: req.body.name });
    }

    res.status(200).json({ message: MESSAGE.CITY.UPDATED });
  } catch (error) {
    next(error);
  }
};

export const CityDelete: RequestHandler = async (req, res, next) => {
  try {
    const city: ICity | any = await throwIfNotExist<ICity>(
      City,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.CITY.NOT_FOUND,
    );

    await throwIfExist<IArea>(Area, { cityId: city?._id, isDeleted: false }, ERROR.CITY.CANT_DELETE);
    // await throwIfExist<IUser>(User, { cityId: city?._id, isDeleted: false }, ERROR.CITY.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate<ICity>(City, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.CITY.REMOVED });
  } catch (error) {
    next(error);
  }
};
