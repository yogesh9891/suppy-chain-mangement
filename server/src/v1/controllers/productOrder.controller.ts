import { ORDER_STATUS, ORDER_TYPE, ROLE_STATUS, ROLES } from "common/constant.common";
import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";

import { createDocuments, findById, findOne, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { newRegExp } from "utils/regex";
import { ProductOrder } from "models/prodcutOrder.model";
import { IUser, User } from "models/user.model";
import { PipelineStage, Types } from "mongoose";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose from "mongoose";
import { Box } from "models/box.model";
import { ProductStock } from "models/productStock.model";
import stateRouter from "v1/routes/state.routes";
import { ProductStockLogs } from "models/productStockLogs.model";

export const createProductOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body, "body = PRODUCT CONTROLLER");

    let storeId = req.user?.userObj?._id;

    const seller = await throwIfNotExist(User, { _id: newObjectId(storeId), isDeleted: false }, ERROR.USER.NOT_FOUND);

    const { productsArr, subTotal, total, userId, status } = req.body;
    let type = ORDER_TYPE.PURCHASE;
    if (userId && userId != "") {
      let user = await findOne(User, { _id: userId });
      req.body.orderedFromId = user?._id;
      req.body.orderedToId = storeId;
    } else {
      if (seller && req.body?.name) {
        let userObj = {
          name: req.body?.name,
          email: req.body.email,
          phone: req.body.phone,
          role: req.body.role,
          gstNo: req.body?.gstNo,
          address: req.body?.address,
          country: seller.countryName,
          state: seller.stateName,
          city: seller.cityName,
          pincode: seller.pincode,
          countryId: seller.countryId,
          stateId: seller.stateId,
          cityId: seller.cityId,
          areaId: seller.areaId,
          storeName: req?.body?.storeName,
        };
        let user = await createDocuments(User, userObj);
        req.body.orderedFromId = user?._id;
        req.body.orderedToId = storeId;
      } else {
        req.body.orderedFromId = storeId;
     
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
      // categoryIdArr: parentCatIdArr,
    };

    const newProduct = await createDocuments(ProductOrder, newProductObj);
    if (productsArr && productsArr?.length > 0) {
      for (const product of productsArr) {
        // for admin
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
          quantity: product.quantity,
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
          quantity: product.quantity,
          totalItems: product.quantity * product.box * product.packet,
          leftItems: product.quantity * product.box * product.packet,
          orderedToId: newProduct.orderedToId,
          orderedFromId: newProduct.orderedFromId,
          batchId: newProduct._id,
          status: currentStatus,
          type: ORDER_TYPE.SELL,
        };
         await createDocuments(ProductStockLogs, newProductObjLogs2);

        if (status == ORDER_STATUS.DELIVERED) {
          let newProductObj = {
            productId: product.productId,
            name: product.name,
            price: product.price,
            msp: product.msp,
            gst: product.gst,
            barCode: product.barCode,
            totalItemInCarton: product.totalItemInCarton,
            box: product.box,
            packet: product.packet,
            quantity: product.quantity,
            totalItems: product.quantity * product.box * product.packet,
            leftItems: product.quantity * product.box * product.packet,
            orderedToId: newProduct.orderedToId,
            orderedFromId: newProduct.orderedFromId,
            batchId: newProduct._id,
            isSold: false,
          };
          const newProductStock = await createDocuments(ProductStock, newProductObj);
        }
      }
    }
    res.status(200).json({ message: MESSAGE.PRODUCT.CREATED, data: newProduct });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const inhouseProductOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body, "body = PRODUCT CONTROLLER");

    let storeId = req.user?.userObj?._id;

    const seller = await throwIfNotExist(User, { _id: newObjectId(storeId), isDeleted: false }, ERROR.USER.NOT_FOUND);

    const { productsArr, subTotal, total, userId, status } = req.body;
    req.body.orderedToId = storeId;

    if (userId && userId != "") {
      let user = await findOne(User, { _id: userId });
      req.body.orderedFromId = user?._id;
    } else {
      if (seller) {
        let userObj = {
          name: req.body?.name,
          email: req.body.email,
          phone: req.body.phone,
          role: req.body.role,
          address: req.body?.address,
          country: seller.countryName,
          state: seller.stateName,
          city: seller.cityName,
          pincode: seller.pincode,
          countryId: seller.countryId,
          stateId: seller.stateId,
          cityId: seller.cityId,
          areaId: seller.areaId,
          storeName: req?.body?.storeName,
        };
        let user = await createDocuments(User, userObj);
        req.body.orderedFromId = user?._id;
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
      // categoryIdArr: parentCatIdArr,
    };

    const newProduct = await createDocuments(ProductOrder, newProductObj);

    res.status(200).json({ message: MESSAGE.PRODUCT.CREATED, data: newProduct });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const getProductOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "QUERY IN GET PRODUCTS");
    console.log(req.query, "QUERY.......");

    let matchObj: Record<string, any> = {};
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

    if (req.query.orderedToId && req.query.orderedToId != "") {
      matchObj.orderedToId = newObjectId(req.query.orderedToId);
    }
    if (req.query.orderedFromId && req.query.orderedFromId != "") {
      matchObj.orderedFromId = newObjectId(req.query.orderedFromId);
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

    const paginatedProducts: any = await paginateAggregate(ProductOrder, pipeline, req.query);

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

export const getProductOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attribute: any = await throwIfNotExist(
      ProductOrder,
      { _id: newObjectId(req.params.id) },
      ERROR.PRODUCT.NOT_FOUND,
    );
    let user: any = {};
    if (attribute && attribute?.orderedFromId) {
      user = await findOne(User, { _id: newObjectId(attribute?.orderedFromId) });
      if (user) {
        attribute.sellerDetails = user;
      }
    }

    if (attribute && attribute?.orderedToId) {
      user = await findOne(User, { _id: newObjectId(attribute?.orderedToId) });
      if (user) {
        attribute.buyerDetails = user;
      }
    }

    res.status(200).json({ message: MESSAGE.PRODUCT.GOTBYID, data: attribute });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const updateProductOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.params.id, "ID");
    let { status } = req.body;
    if (!req.params.id) throw new Error("Can't find product.");
    const updatedObj: any = {};

    const productOrder = await ProductOrder.findById(req.params.id).lean().exec();
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
        if (
          productOrder &&
          productOrder.orderStatus?.currentStatus == ORDER_STATUS.TRANSIT &&
          status == ORDER_STATUS.DELIVERED
        ) {
            let productStock = await ProductStock.findOne({
              orderedToId: productOrder?.orderedToId,
              productId: product.productId,
            }).exec();
          if (productStock) {
            await ProductStock.findByIdAndUpdate(productStock._id, {
              $inc: {
                leftItems: +(product.quantity * productStock.box * productStock.packet),
                quantity: +product.quantity,
              },
            }).exec();

          } else {
            let newProductObj = {
              productId: product.productId,
              name: product.name,
              price: product.price,
              msp: product.msp,
              gst: product.gst,
              barCode: product.barCode,
              totalItemInCarton: product.totalItemInCarton,
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
                quantity: -product.quantity,
                leftItems: -(product.quantity * product.box * product.packet),
              },
            }).exec();
          }
        }
      }
    }
    await ProductOrder.findByIdAndUpdate(req.params.id, updatedObj).exec();

    res.status(200).json({ message: MESSAGE.PRODUCT.UPDATED });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const getProductStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "QUERY IN GET PRODUCTS");
    console.log(req.query, "QUERY.......");

    let matchObj: Record<string, any> = {};
    let sortObj: Record<string, any> = {};
    let pipeline: PipelineStage[] = [];

    if (typeof req.query.sort === "string" && typeof req.query.sortOrder === "string") {
      sortObj[`${req.query.sort}`] = parseInt(req.query.sortOrder);
    } else {
      sortObj["createdAt"] = -1;
    }

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    // if (req.user?.userObj?.role != ROLES.ADMIN) {
    //   matchObj.orderedToId = req.user?.userObj?._id;
    // }

    if (req.query.orderedFromId) {
      matchObj.orderedFromId = newObjectId(req.query.orderedFromId);
    }

    pipeline = [
      {
        $match: matchObj,
      },

      {
        $group: {
          _id: "$productId",
          name: {
            $first: "$name",
          },
          productId: {
            $first: "$productId",
          },
          price: {
            $first: "$price",
          },
          quantity: {
            $sum: "$quantity",
          },
          totalItems: {
            $first: "$totalItems",
          },
          leftItems: {
            $first: "$leftItems",
          },
          createdAt: {
            $first: "$createdAt",
          },
          updatedAt: {
            $first: "$updatedAt",
          },
        },
      },
      { $sort: sortObj },
    ];

    /**
     * TODO Change to aggregation...
     */

    // pipeline.push({ $sort: sortObj });

    const paginatedProducts: any = await paginateAggregate(ProductStock, pipeline, req.query);

    console.log(paginatedProducts.total, "TOTAL");
    console.log(paginatedProducts.data, "LENGTH");
    res
      .status(200)
      .json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: paginatedProducts.data, total: paginatedProducts.total });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};
