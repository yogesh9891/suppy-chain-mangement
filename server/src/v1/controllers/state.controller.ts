import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { RequestHandler } from "express";
import { City } from "models/city.model";
import { IState, State } from "models/state.model";
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

export const StateAdd: RequestHandler = async (req, res, next) => {
  try {
    const { name, countryId, countryName } = req.body;

    const requiredFields: any = {
      Name: name,
      Country_ID: countryId,
      Country_Name: countryName,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IState>(
      State,
      {
        name: newRegExp(req.body.name),
        countryId,
        isDeleted: false,
      },
      ERROR.STATE.EXIST,
    );

    const data: any = await createDocuments<IState>(State, req.body);

    res.status(201).json({ message: MESSAGE.STATE.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const StateGet: RequestHandler = async (req, res, next) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (typeof req.query.countryId === "string") {
      matchObj.countryId = new mongoose.Types.ObjectId(req.query.countryId);
    }

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    let pipeline: PipelineStage[] = [
      {
        $match: matchObj,
      },
    ];

    const data = await paginateAggregate(State, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.STATE.ALLSTATES, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const StateGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist(
      State,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.STATE.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.STATE.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const StateUpdate: RequestHandler = async (req, res, next) => {
  try {
    const regionData: IState | any = await throwIfNotExist<IState>(
      State,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.STATE.NOT_FOUND,
    );

    if (req.body.name) {
      await throwIfExist(
        State,
        {
          _id: { $ne: req.params.id },
          countryId: req.body.countryId ? newObjectId(req.body.countryId) : newObjectId(regionData?.countryId),
          name: newRegExp(req.body.name),
        },
        ERROR.STATE.EXIST,
      );
    }

    const data = await findByIdAndUpdate<IState>(State, newObjectId(req.params.id), req.body);

    if (typeof req.body.name === "string") {
      await updateMany(State, { regionId: req.params.id }, { regionName: req.body.name });
      await updateMany(City, { regionId: req.params.id }, { regionName: req.body.name });
      await updateMany(State, { regionId: req.params.id }, { regionName: req.body.name });
      //   await updateMany(User, { regionId: req.params.id }, { regionName: req.body.name });
    }

    res.status(200).json({ message: MESSAGE.STATE.ALLSTATES, data: data?._id });
  } catch (error) {
    next(error);
  }
};

export const StateDelete: RequestHandler = async (req, res, next) => {
  try {
    const region = await throwIfNotExist<IState>(
      State,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.STATE.NOT_FOUND,
    );

    await throwIfExist(State, { regionId: newObjectId(region?._id), isDeleted: false }, ERROR.STATE.CANT_DELETE);
    // await throwIfExist(User, { regionId: newObjectId(region?._id), isDeleted: false }, ERROR.STATE.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate<IState>(State, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.STATE.REMOVED });
  } catch (error) {
    next(error);
  }
};
