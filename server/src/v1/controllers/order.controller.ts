import { BARCODE_TYPE, ORDER_STATUS, ORDER_TYPE, ROLES } from "common/constant.common";
import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";

import { createDocuments, findById, findOne, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { newRegExp } from "utils/regex";
import { Order } from "models/order.model";
import { User } from "models/user.model";
import { PipelineStage, Types } from "mongoose";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose from "mongoose";
import { Box } from "models/box.model";
import { ProductStock } from "models/productStock.model";
import { ProductStockLogs } from "models/productStockLogs.model";

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body, "body = PRODUCT CONTROLLER");

    let storeId = req.user?.userObj?._id;

    if (req.body?.storeId) {
      storeId = newObjectId(req.body?.storeId);
    }


    let createdBy = {
      userId: req.user?.userObj?._id,
      name: req.user?.userObj?.name,
    } 

    const seller = await throwIfNotExist(User, { _id: newObjectId(storeId), isDeleted: false }, ERROR.USER.NOT_FOUND);

    const { productsArr, subTotal, total, phone, userId, status } = req.body;

    let sellerDetails = {};

    if (seller) {
      sellerDetails = {
        name: seller.storeName,
        email: seller.email,
        phone: seller.phone,
        address: seller.address,
        storeName: seller.storeName,
        gstNo: seller.gstNo,
        country: seller.countryName,
        state: seller.stateName,
        city: seller.cityName,
        pincode: seller.pincode,
        countryId: seller.countryId,
        stateId: seller.stateId,
        cityId: seller.cityId,
        areaId: seller.areaId,
        zoneId: seller.zoneId,
      };
      req.body.sellerDetails = sellerDetails;
      req.body.orderedFromId = storeId;
      if (userId && userId != "") {
        let user = await findOne(User, { _id: userId });
        req.body.orderedToId = user?._id;
        req.body.buyerDetails = user;
      } else {
        let userObj = {
          name: req.body?.name,
          email: req.body.email,
          phone: req.body.phone,
          address: req.body?.address,
          country: seller.countryName,
          state: seller.stateName,
          city: seller.cityName,
          pincode: seller.pincode,
          countryId: seller.countryId,
          stateId: seller.stateId,
          cityId: seller.cityId,
          areaId: seller.areaId,
          gstNo: req.body?.gstNo,
          storeName: req?.body?.storeName,
          storeId,
        };
        let user = await createDocuments(User, userObj);
        req.body.orderedToId = user?._id;
        req.body.buyerDetails = user;
      }
    }

    let today = new Date();
      let currentStatus = status ? status : ORDER_STATUS.PENDING;
    req.body.orderStatus = {
      currentStatus,
      on: today,
    };
    req.body.statusArr = [
      {
        status: currentStatus,
        on: today,
      },
    ];


    
    const newProductObj: any = {
      ...req.body,
      createdBy,
      // categoryIdArr: parentCatIdArr,
    };

    const newProduct = await createDocuments(Order, newProductObj);


    if (newProduct && productsArr && productsArr?.length > 0) {
      for (const product of productsArr) {
        let newProductObjLogs = {
          productId: product.productId,
          name: product.name,
          price: product.price,
          msp: product.msp,
          gst: product.gst,
          barCode: product.barCode,
          totalItemInCarton: product.totalItemInCarton,
          box: product.box,
          packet: product.packet,
          quantity: (product.totalQunatity/(product.box * product.packet)),
          totalItems: product.quantity * product.box * product.packet,
          leftItems: product.quantity * product.box * product.packet,
          orderedToId: newProduct.orderedToId,
          orderedFromId: newProduct.orderedFromId,
          batchId: newProduct._id,
          status: currentStatus,
          type: ORDER_TYPE.PURCHASE,
        };
        await createDocuments(ProductStockLogs, newProductObjLogs);

        // for Seller
        let newProductObjLogs2 = {
          productId: product.productId,
          name: product.name,
          price: product.price,
          msp: product.msp,
          gst: product.gst,
          barCode: product.barCode,
          totalItemInCarton: product.totalItemInCarton,
          box: product.box,
          packet: product.packet,
          quantity: product.totalQunatity / (product.box * product.packet),
          totalItems: product.quantity * product.box * product.packet,
          leftItems: product.quantity * product.box * product.packet,
          orderedToId: newProduct.orderedToId,
          orderedFromId: newProduct.orderedFromId,
          batchId: newProduct._id,
          status: currentStatus,
          type: ORDER_TYPE.SELL,
        };
        await createDocuments(ProductStockLogs, newProductObjLogs2);


        if (currentStatus == ORDER_STATUS.DELIVERED) {
          let productStock = await ProductStock.findOne({
            orderedToId: storeId,
            productId: product.productId,
          }).exec();

          if (productStock) {
            await ProductStock.findByIdAndUpdate(productStock._id, {
              $inc: { leftItems: -product.totalQunatity, quantity: -(product.quantity *(product.barCodeType == BARCODE_TYPE.CARTON ?1 :0)) },
            }).exec();
          } else {
            throw new Error("Porduct out of sotck");
          }
        }
      }
    }


    res.status(200).json({ message: MESSAGE.PRODUCT.CREATED, data: newProduct });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "QUERY IN GET PRODUCTS");
    console.log(req.query, "QUERY.......");
    console.log(req.user, "USER.......");

    let matchObj: any = {};
    let sortObj: Record<string, any> = {};
    let pipeline: PipelineStage[] = [];

    if (typeof req.query.sort === "string" && typeof req.query.sortOrder === "string") {
      sortObj[`${req.query.sort}`] = parseInt(req.query.sortOrder);
    } else {
      sortObj["createdAt"] = -1;
      sortObj["_id"] = -1;
    }

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    if (req.user?.userObj?.role != ROLES.ADMIN) {
      matchObj.orderedFromId = req.user?.userObj?._id;
    }

    if (req.user?.userObj?.role == ROLES.SALES) {
      matchObj.orderedFromId = req.user?.userObj?.storeId;
      console.log(matchObj);
      matchObj["createdBy.userId"] = newObjectId(req.user?.userId);
    }

    pipeline = [
      {
        $match: matchObj,
      },

      // {
      //   $group: {
      //     _id: "$_id",

      //     name: {
      //       $first: "$name",
      //     },
      //     description: {
      //       $first: "$description",
      //     },
      //     isFocused: {
      //       $first: "$isFocused",
      //     },
      //     brandId: {
      //       $first: "$brandId",
      //     },

      //     brand: {
      //       $first: "$brand",
      //     },

      //     skuCode: {
      //       $first: "$skuCode",
      //     },
      //     weight: {
      //       $first: "$weight",
      //     },
      //     stock: {
      //       $first: "$stock",
      //     },
      //     mrp: {
      //       $first: "$mrp",
      //     },

      //     imagesArr: {
      //       $first: "$imagesArr",
      //     },
      //     thumbnail: {
      //       $first: "$thumbnail",
      //     },

      //     createdAt: {
      //       $first: "$createdAt",
      //     },
      //     updatedAt: {
      //       $first: "$updatedAt",
      //     },
      //   },
      // },
      { $sort: sortObj },
    ];

    /**
     * TODO Change to aggregation...
     */

    pipeline.push({ $sort: sortObj });

    const paginatedProducts: any = await paginateAggregate(Order, pipeline, req.query);

    console.log(paginatedProducts.total, "TOTAL");
    console.log(paginatedProducts.data.length, "LENGTH");
    res
      .status(200)
      .json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: paginatedProducts.data, total: paginatedProducts.total });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attribute = await throwIfNotExist(Order, { _id: newObjectId(req.params.id) }, ERROR.PRODUCT.NOT_FOUND);

    res.status(200).json({ message: MESSAGE.PRODUCT.GOTBYID, data: attribute });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};


export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.params.id, "ID");
    let { status } = req.body;
    if (!req.params.id) throw new Error("Can't find product.");
    const updatedObj: any = {};

    const productOrder = await Order.findById(req.params.id).lean().exec();
    let today = new Date();

    updatedObj.orderStatus = {
      currentStatus: status,
      on: today,
    };

    updatedObj.statusArr = productOrder?.statusArr;
    updatedObj.statusArr.push({
      status: status,
      on: today,
    });

    let productsArr = productOrder?.productsArr;
    if (productOrder && productsArr && productsArr?.length > 0) {
      for (const product of productsArr) {
        await ProductStockLogs.findOneAndUpdate(
          { batchId: productOrder?._id, productId: product.productId },
          {
            status: status,
          },
        ).exec();
        if (productOrder && status == ORDER_STATUS.ACCEPTED) {
          let productStock = await ProductStock.findOne({
            orderedToId: productOrder?.orderedToId,
            productId: product.productId,
          }).exec();

          let newProductObj = {
            productId: product.productId,
            name: product.name,
            price: product.price,
            msp: product.msp,
            gst: product.gst,
            barCode: product.barCode,
            box: product.box,
            packet: product.packet,
            quantity: product.quantity,
            totalItems: product.quantity * product.box * product.packet,
            leftItems: product.quantity * product.box * product.packet,
            orderedToId: productOrder.orderedToId,
            orderedFromId: productOrder.orderedFromId,
            batchId: productOrder._id,
            isSold: false,
          };
          const newProductStock = await createDocuments(ProductStock, newProductObj);
        }
        //update Order Stokc
        let productOrderStock = await ProductStock.findOne({
          orderedToId: productOrder.orderedFromId,
          productId: product.productId,
        }).exec();

        if (productOrderStock) {
          await ProductStock.findByIdAndUpdate(productOrderStock._id, {
            $inc: {
              leftItems: -product.totalQunatity,
              quantity: -(product.quantity * (product.barCodeType == BARCODE_TYPE.CARTON ? 1 : 0)),
            },
          }).exec();
        }
      }
    }

    await Order.findByIdAndUpdate(req.params.id, updatedObj).exec();

    res.status(200).json({ message: MESSAGE.PRODUCT.UPDATED });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};