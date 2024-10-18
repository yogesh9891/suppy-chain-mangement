import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { NextFunction, RequestHandler } from "express";
import { BarCode, IBarCode } from "models/barcode.model";
import { IState, State } from "models/state.model";
import { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import {
  createDocuments,
  findByIdAndUpdate,
  findOne,
  newObjectId,
  throwIfExist,
  throwIfNotExist,
  updateMany,
} from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";
import { generateBarCodeWithValue } from "helpers/barCode";
import { Product } from "models/product.model";
import { BARCODE_TYPE } from "common/constant.common";

export const BarCodeAdd: RequestHandler = async (req, res, next) => {
  try {
    let { barCodeType, name } = req.body;
    const requiredFields = { Name: name, BarCodeType: barCodeType };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IBarCode>(
      BarCode,
      {
        name: newRegExp(name),
        barCodeType: barCodeType,
        isDeleted: false,
      },
      ERROR.BARCODE.EXIST,
    );
    const productObj = await throwIfNotExist(
      Product,
      { _id: newObjectId(req.body.productId), isDeleted: false },
      ERROR.PRODUCT.NOT_FOUND,
    );
    let barCode = "";
    if (productObj && barCodeType != BARCODE_TYPE.PACKET) {
      let countTotalBarCode = await BarCode.countDocuments();
      barCode = generateBarCodeWithValue(countTotalBarCode + 1);
    }

    const newBarCodeObj = {
      barCode,
      ...req.body,
    };

    const data: any = await createDocuments(BarCode, newBarCodeObj);

    res.status(201).json({ message: MESSAGE.BARCODE.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const BarCodeGet: RequestHandler = async (req, res, next) => {
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

    const data = await paginateAggregate(BarCode, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.BARCODE.ALLBARCODES, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const BarCodeGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist(
      BarCode,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.BARCODE.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.BARCODE.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const BarCodeUpdate: RequestHandler = async (req, res, next) => {
  try {
    await throwIfNotExist(BarCode, { _id: newObjectId(req.params.id), isDeleted: false }, ERROR.BARCODE.NOT_FOUND);

    // if (req.body.name) {
    //   await throwIfExist(
    //     BarCode,
    //     {
    //       _id: { $ne: newObjectId(req.params.id) },
    //       name: newRegExp(req.body.name),
    //       isDeleted: false,
    //     },
    //     ERROR.BARCODE.EXIST,
    //   );
    // }
    const data: IBarCode | any = await findByIdAndUpdate<IBarCode>(BarCode, newObjectId(req.params.id), req.body);

    res.status(200).json({ message: MESSAGE.BARCODE.UPDATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const BarCodeDelete: RequestHandler = async (req, res, next) => {
  try {
    const barcode: any = await throwIfNotExist<IBarCode>(
      BarCode,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.BARCODE.NOT_FOUND,
    );

    await throwIfExist<IState>(State, { barcodeId: barcode?._id, isDeleted: false }, ERROR.BARCODE.CANT_DELETE);
    // await throwIfExist<IUser>(User, { barcodeId: barcode?._id, isDeleted: false }, ERROR.BARCODE.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(BarCode, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.BARCODE.REMOVED });
  } catch (error) {
    next(error);
  }
};

export const getBarCodeWithProduct: RequestHandler = async (req, res, next) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };
    let pipeline: PipelineStage[] = [];
    let storeId = req.user?.userObj?._id;

    if (req?.query?.storeId) {
       storeId = req?.query?.storeId;
    }
    pipeline = [
      {
        $lookup: {
          from: "productstocks",
          localField: "productId",
          foreignField: "productId",
          pipeline: [{ $match: { orderedToId: newObjectId(storeId) } }],
          as: "productStock",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $project: {
          price: {
            $first: "$productStock.price",
          },
          orderedToId: {
            $first: "$productStock.orderedToId",
          },
          msp: {
            $first: "$product.msp",
          },

          gst: {
            $first: "$product.gst",
          },
          packet: {
            $first: "$product.packet",
          },
          box: {
            $first: "$product.box",
          },
          barCode: "$barCode",
          barCodeType: "$barCodeType",
          barCodeId: "$_id",
          name: "$name",
          productId: "$productId",
          totalItems: {
            $sum: "$productStock.totalItems",
          },
          leftItems: {
            $sum: "$productStock.leftItems",
          },
        },
      },
      {
        $match: {
          orderedToId: newObjectId(storeId),
        },
      },
    ];

    const productsArr = await paginateAggregate(BarCode, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: productsArr.data, total: productsArr.total });
  } catch (error) {
    next(error);
  }
};

export const getLatesBarCodeInSeries: RequestHandler = async (req, res, next) => {
  try {
    console.log("======================================================================");

    let countTotalBarCode = await BarCode.countDocuments();
    let barCode = generateBarCodeWithValue(countTotalBarCode + 1);
    console.log(barCode, "======================================================================");
    res.status(200).json({ message: MESSAGE.BARCODE.GOTBYID, data: barCode });
  } catch (error) {
    next(error);
  }
};
