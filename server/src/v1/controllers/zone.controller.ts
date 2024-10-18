import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { RequestHandler } from "express";
import { Area } from "models/area.model";
import { City } from "models/city.model";
import { Zone, IZone } from "models/zone.model";
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

export const ZoneAdd: RequestHandler = async (req, res, next) => {
  try {
    const { name } = req.body;

    const requiredFields = { Name: name };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IZone>(
      Zone,
      {
        name: newRegExp(name),
        isDeleted: false,
      },
      ERROR.COUNTRY.EXIST,
    );

    const newZoneObj = {
      ...req.body,
    };

    const data: any = await createDocuments(Zone, newZoneObj);

    res.status(201).json({ message: MESSAGE.COUNTRY.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const ZoneGet: RequestHandler = async (req, res, next) => {
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

    const data = await paginateAggregate(Zone, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.COUNTRY.ALLCOUNTRIES, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const ZoneGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist(
      Zone,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.COUNTRY.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.COUNTRY.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const ZoneUpdate: RequestHandler = async (req, res, next) => {
  try {
    await throwIfNotExist(Zone, { _id: newObjectId(req.params.id), isDeleted: false }, ERROR.COUNTRY.NOT_FOUND);

    if (req.body.name) {
      await throwIfExist(
        Zone,
        {
          _id: { $ne: newObjectId(req.params.id) },
          name: newRegExp(req.body.name),
          isDeleted: false,
        },
        ERROR.COUNTRY.EXIST,
      );
    }

    const data: IZone | any = await findByIdAndUpdate<IZone>(Zone, newObjectId(req.params.id), req.body);

    if (typeof req.body.name === "string") {
      await updateMany(State, { zoneId: req.params.id }, { zoneName: req.body.name });
      await updateMany(City, { zoneId: req.params.id }, { zoneName: req.body.name });
      await updateMany(Area, { zoneId: req.params.id }, { zoneName: req.body.name });
      // await updateMany(User, { zoneId: req.params.id }, { zoneName: req.body.name });
    }

    res.status(200).json({ message: MESSAGE.COUNTRY.UPDATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const ZoneDelete: RequestHandler = async (req, res, next) => {
  try {
    const zone: any = await throwIfNotExist<IZone>(
      Zone,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.COUNTRY.NOT_FOUND,
    );

    await throwIfExist<IState>(State, { zoneId: zone?._id, isDeleted: false }, ERROR.COUNTRY.CANT_DELETE);
    // await throwIfExist<IUser>(User, { zoneId: zone?._id, isDeleted: false }, ERROR.COUNTRY.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(Zone, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.COUNTRY.REMOVED });
  } catch (error) {
    next(error);
  }
};
