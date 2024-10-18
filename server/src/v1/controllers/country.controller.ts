import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { RequestHandler } from "express";
import { Area } from "models/area.model";
import { City } from "models/city.model";
import { Country, ICountry } from "models/country.model";
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

export const CountryAdd: RequestHandler = async (req, res, next) => {
  try {
    const { name } = req.body;

    const requiredFields = { Name: name };

    verifyRequiredFields(requiredFields);

    await throwIfExist<ICountry>(
      Country,
      {
        name: newRegExp(name),
        isDeleted: false,
      },
      ERROR.COUNTRY.EXIST,
    );

    const newCountryObj = {
      ...req.body,
    };

    const data: any = await createDocuments(Country, newCountryObj);

    res.status(201).json({ message: MESSAGE.COUNTRY.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const CountryGet: RequestHandler = async (req, res, next) => {
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

    const data = await paginateAggregate(Country, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.COUNTRY.ALLCOUNTRIES, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const CountryGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist(
      Country,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.COUNTRY.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.COUNTRY.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const CountryUpdate: RequestHandler = async (req, res, next) => {
  try {
    await throwIfNotExist(Country, { _id: newObjectId(req.params.id), isDeleted: false }, ERROR.COUNTRY.NOT_FOUND);

    if (req.body.name) {
      await throwIfExist(
        Country,
        {
          _id: { $ne: newObjectId(req.params.id) },
          name: newRegExp(req.body.name),
          isDeleted: false,
        },
        ERROR.COUNTRY.EXIST,
      );
    }

    const data: ICountry | any = await findByIdAndUpdate<ICountry>(Country, newObjectId(req.params.id), req.body);

    if (typeof req.body.name === "string") {
      await updateMany(State, { countryId: req.params.id }, { countryName: req.body.name });
      await updateMany(City, { countryId: req.params.id }, { countryName: req.body.name });
      await updateMany(Area, { countryId: req.params.id }, { countryName: req.body.name });
      // await updateMany(User, { countryId: req.params.id }, { countryName: req.body.name });
    }

    res.status(200).json({ message: MESSAGE.COUNTRY.UPDATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const CountryDelete: RequestHandler = async (req, res, next) => {
  try {
    const country: any = await throwIfNotExist<ICountry>(
      Country,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.COUNTRY.NOT_FOUND,
    );

    await throwIfExist<IState>(State, { countryId: country?._id, isDeleted: false }, ERROR.COUNTRY.CANT_DELETE);
    // await throwIfExist<IUser>(User, { countryId: country?._id, isDeleted: false }, ERROR.COUNTRY.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(Country, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.COUNTRY.REMOVED });
  } catch (error) {
    next(error);
  }
};
