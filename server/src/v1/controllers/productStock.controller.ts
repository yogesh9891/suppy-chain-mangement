import { ORDER_STATUS, ORDER_TYPE, ROLES } from "common/constant.common";
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
import { Product } from "models/product.model";
import { adminStockBuilder } from "builder/stock.builder";

export const addProductBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body, "body = PRODUCT CONTROLLER");

    let storeId = req.user?.userObj?._id;

    if (req.user?.userObj?.role == ROLES.ADMIN) {
      storeId = req.body.orderedToId;
    }

    const { productArr } = req.body;
    if (productArr && productArr?.length > 0) {
      for (const product of productArr) {
        let productObj = await Product.findOne({
          _id: newObjectId(product.productId),
        }).exec();
        if (productObj) {
          let productOrderStock = await ProductStock.findOne({
            orderedToId: newObjectId(storeId),
            productId: product.productId,
          }).exec();
          if (!productOrderStock) {
            let newProductObjLogs = {
              productId: product.productId,
              brandId: productObj.brandId,
              colorId: productObj.colorId,
              sizeId: productObj.sizeId,
              name: product.name,
              price: product.msp,
              msp: product.msp,
              gst: product.gst,
              barCode: product.barCode,
              totalItemInCarton: product.totalItemInCarton,
              box: product.box,
              packet: product.packet,
              quantity: 0,
              totalItems: 0 * product.box * product.packet,
              leftItems: 0 * product.box * product.packet,
              orderedToId: storeId,
              status: ORDER_STATUS.PENDING,
              type: ORDER_TYPE.PURCHASE,
            };
            await createDocuments(ProductStockLogs, newProductObjLogs);
            let newProductObj = {
              productId: product.productId,
              brandId: productObj.brandId,
              colorId: productObj.colorId,
              sizeId: productObj.sizeId,
              name: product.name,
              price: product.msp,
              msp: product.msp,
              gst: product.gst,
              totalItemInCarton: product.totalItemInCarton,
              box: product.box,
              packet: product.packet,
              totalItems: 0,
              quantity: 0,
              minStock: 0,
              leftItems: 0,
              orderedToId: storeId,
              isSold: false,
            };
            const newProductStock = await createDocuments(ProductStock, newProductObj);
          } else {
            throw new Error(product.name + " already addded in store");
          }
        }
      }
    }
    res.status(200).json({ message: MESSAGE.PRODUCT.CREATED });
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
      sortObj["name"] = -1;
    }

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    // if (req.user?.userObj?.role != ROLES.ADMIN) {
    //   matchObj.orderedToId = req.user?.userObj?._id;
    // }
    let StockObj: any = {};
    if (req.query.orderedFromId) {
      matchObj.orderedFromId = newObjectId(req.query.orderedFromId);
      StockObj.orderedFromId = newObjectId(req.query.orderedFromId);
    }

    if (req.query.orderedToId && !req.query.stock) {
      matchObj.orderedToId = newObjectId(req.query.orderedToId);
      StockObj.orderedToId = newObjectId(req.query.orderedToId);
    }

    if (req.query.size && req.query.size != "" && typeof req.query.size == "string") {
      matchObj.sizeId = { $in: req.query.size.split(",").map((el) => newObjectId(el)) };
    }

    if (req.query.color && req.query.color != "" && typeof req.query.color == "string") {
      matchObj.colorId = { $in: req.query.color.split(",").map((el) => newObjectId(el)) };
    }

    if (req.query.brand && req.query.brand != "" && typeof req.query.brand == "string") {
      matchObj.brandId = { $in: req.query.brand.split(",").map((el) => newObjectId(el)) };
    }

       pipeline = [
         {
           $match: matchObj,
         },
         {
           $lookup: {
              from: "productstocklogs",
              localField: "productId",
              foreignField: "productId",
              as: "productstocklogs",
             pipeline: [
               {
                 $match: { type: "PURCHASE" },
               },
               {
                 $group: {
                   _id: "$productId",
                   totalBuyItems: {
                     $sum: {
                       $cond: [
                         {
                           $and: [
                             {
                               $eq: ["$type", "PURCHASE"],
                             },
                             {
                               $eq: ["$orderedToId", StockObj.orderedToId],
                             },
                           ],
                         },
                         "$quantity",
                         0,
                       ],
                     },
                   },
                   totalSellItems: {
                     $sum: {
                       $cond: [
                         {
                           $and: [
                             {
                               $eq: ["$type", "SELL"],
                             },
                             {
                               $eq: ["$orderedToId", StockObj.orderedToId],
                             },
                           ],
                         },
                         "$quantity",
                         0,
                       ],
                     },
                   },
                 },
               },
             ],
           },
         },
         {
           $unwind: {
             path: "$productstocklogs",
             preserveNullAndEmptyArrays: false,
           },
         },
         {
           $addFields: {
             totalTransitItems: { $subtract: ["$productstocklogs.totalBuyItems", "$productstocklogs.totalSellItems"] },
           },
         },
         //  {
         //    $group: {
         //      _id: "$pro",

         //      name: {
         //        $first: "$name",
         //      },
         //      productStockId: {
         //        $first: "$productStockId",
         //      },
         //      description: {
         //        $first: "$description",
         //      },
         //      isFocused: {
         //        $first: "$isFocused",
         //      },
         //      brandId: {
         //        $first: "$brandId",
         //      },

         //      brand: {
         //        $first: "$brand",
         //      },

         //      skuCode: {
         //        $first: "$skuCode",
         //      },
         //      weight: {
         //        $first: "$weight",
         //      },
         //      stock: {
         //        $first: "$stock",
         //      },
         //      mrp: {
         //        $first: "$mrp",
         //      },

         //      imagesArr: {
         //        $first: "$imagesArr",
         //      },
         //      thumbnail: {
         //        $first: "$thumbnail",
         //      },

         //      createdAt: {
         //        $first: "$createdAt",
         //      },
         //      updatedAt: {
         //        $first: "$updatedAt",
         //      },
         //    },
         //  },
         { $sort: sortObj },
       ];

      if (req.user?.userObj?.role == ROLES.ADMIN &&  req.query?.stock) {
            pipeline = adminStockBuilder(matchObj, StockObj, {name:1});
      }


 

    /**
     * TODO Change to aggregation...
     */

    // pipeline.push({ $sort: sortObj });

    const paginatedProducts: any = await paginateAggregate(ProductStock, pipeline, req.query);

    res
      .status(200)
      .json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: paginatedProducts.data, total: paginatedProducts.total });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};



export const updateProductStock: any = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.params.id, "ID");
    let { status } = req.body;
    if (!req.params.id) throw new Error("Can't find product.");
    const updatedObj: any = {};

    if (req?.body?.minStock) {
      updatedObj.minStock = req?.body?.minStock;
    }
    const productOrder = await ProductStock.findById(req.params.id).lean().exec();
    if (!productOrder) throw new Error("Can't find product.");

    await ProductStock.findByIdAndUpdate(req.params.id, updatedObj).exec();

    res.status(200).json({ message: MESSAGE.PRODUCT.UPDATED });
  } catch (error) {
    next(error);
  }
};

export const deleteProductStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("PRODUCT CONTROLLER");
    const removed = await ProductStock.findByIdAndDelete(req.params.id).exec();
    res.status(200).json({ message: MESSAGE.PRODUCT.REMOVED });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};
