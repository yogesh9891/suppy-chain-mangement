import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { NextFunction, RequestHandler } from "express";
import { Payment, IPayment } from "models/payment.model";
import { IState, State } from "models/state.model";
import { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import {
  createDocuments,
  findByIdAndUpdate,
  newObjectId,
  throwIfExist,
  throwIfNotExist,
} from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";

export const PaymentAdd: RequestHandler = async (req, res, next) => {
  try {
    let { storeId,amount,description, userId } = req.body;
    let createdBy = req.user?.userId;
    const newPaymentObj = {
      createdBy,
      storeId,
      amount,
      description,
      userId,
    };

    const data: any = await createDocuments(Payment, newPaymentObj);

    res.status(201).json({ message: MESSAGE.PAYMENT.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const PaymentGet: RequestHandler = async (req, res, next) => {
  try {
    let matchObj: Record<string, any> = { };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    let userId = req.user?.userObj?._id;
    matchObj["$or"] = [{
      createdBy: userId,
    }, {
      storeId: userId,
    }
  ];

    let pipeline: PipelineStage[] = [
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: matchObj,
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: { path: "$customer", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "storeId",
          foreignField: "_id",
          as: "store",
        },
      },
      {
        $unwind: { path: "$store", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdUser",
        },
      },
      {
        $unwind: { path: "$createdUser", preserveNullAndEmptyArrays: true },
      },
      {
        $project:
          {
            _id: 1,
            userId: 1,
            storeId: 1,
            amount: 1,
            description: 1,
            "customer.name": 1,
            "store.name": 1,
            "createdUser.name": 1,
          },
      },
    ];

    const data = await paginateAggregate(Payment, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.PAYMENT.ALLPAYMENTS, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const PaymentGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist(
      Payment,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.PAYMENT.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.PAYMENT.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const PaymentUpdate: RequestHandler = async (req, res, next) => {
  try {
    await throwIfNotExist(Payment, { _id: newObjectId(req.params.id), isDeleted: false }, ERROR.PAYMENT.NOT_FOUND);

    // if (req.body.name) {
    //   await throwIfExist(
    //     Payment,
    //     {
    //       _id: { $ne: newObjectId(req.params.id) },
    //       name: newRegExp(req.body.name),
    //       isDeleted: false,
    //     },
    //     ERROR.PAYMENT.EXIST,
    //   );
    // }
    const data: IPayment | any = await findByIdAndUpdate<IPayment>(Payment, newObjectId(req.params.id), req.body);

    res.status(200).json({ message: MESSAGE.PAYMENT.UPDATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const PaymentDelete: RequestHandler = async (req, res, next) => {
  try {
    const barcode: any = await throwIfNotExist<IPayment>(
      Payment,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.PAYMENT.NOT_FOUND,
    );

    await throwIfExist<IState>(State, { barcodeId: barcode?._id, isDeleted: false }, ERROR.PAYMENT.CANT_DELETE);
    // await throwIfExist<IUser>(User, { barcodeId: barcode?._id, isDeleted: false }, ERROR.PAYMENT.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate(Payment, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.PAYMENT.REMOVED });
  } catch (error) {
    next(error);
  }
};

export const getPaymentWithProduct: RequestHandler = async (req, res, next) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };
    let pipeline: PipelineStage[] = [];
    let storeId = req.user?.userObj?._id;

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
          payment: "$payment",
          paymentType: "$paymentType",
          paymentId: "$_id",
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

    const productsArr = await paginateAggregate(Payment, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: productsArr.data, total: productsArr.total });
  } catch (error) {
    next(error);
  }
};


