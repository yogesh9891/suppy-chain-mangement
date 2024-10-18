import { ORDER_STATUS, ORDER_TYPE, PRODUCT_STATUS, ROLE_STATUS, ROLES } from "common/constant.common";
import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";

import { createDocuments, findById, findOne, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { newRegExp } from "utils/regex";
import { CompanyOrder } from "models/companyOrder.model";
import { IUser, User } from "models/user.model";
import { PipelineStage, Types } from "mongoose";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose from "mongoose";
import { Box } from "models/box.model";
import { ProductStock } from "models/productStock.model";
import stateRouter from "v1/routes/state.routes";
import { CompanyOrderLogs } from "models/companyOrderLogs.model";
import { Product } from "models/product.model";

export const createCompanyOrder = async (req: Request, res: Response, next: NextFunction) => {
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
    let currentStatus =  ORDER_STATUS.PENDING;
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

    if (req.body?.ordernName) {
      req.body.name = req.body?.ordernName;
    }

    const newProductObj: any = {
      ...req.body,
      // categoryIdArr: parentCatIdArr,
    };

    const newProduct = await createDocuments(CompanyOrder, newProductObj);
    if (productsArr && productsArr?.length > 0) {
      for (const product of productsArr) {
        // for admin
        let productObj = await Product.findOne({
          _id: newObjectId(product.productId),
        }).exec();
        if (productObj) {
          let newProductObjLogs = {
            productId: product.productId,
            brandId: productObj.brandId,
            colorId: productObj.colorId,
            sizeId: productObj.sizeId,
            name: product.name,
            price: product.price,
            msp: product.msp,
            gst: product.gst,
            quantity: 0,
            previousQuantity: product.quantity,
            currentQuantity: 0,
            leftQuantity: 0,
            orderedToId: newProduct.orderedToId,
            orderedFromId: newProduct.orderedFromId,
            batchId: newProduct._id,
            status: ORDER_STATUS.PENDING,
            type: ORDER_TYPE.PURCHASE,
          };
          await createDocuments(CompanyOrderLogs, newProductObjLogs);
        }
      }
    }
    res.status(200).json({ message: MESSAGE.PRODUCT.CREATED, data: newProduct });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const addProductCompanyOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {

     console.log(req.params.id, "ID");
     let { status } = req.body;
     if (!req.params.id) throw new Error("Can't find order.");
     const updatedObj: any = {};

     let companyOrder = await CompanyOrder.findById(req.params.id).lean().exec();
     if (!companyOrder) {
       throw new Error("Can't find order.");
     }

     if (req.body?.productsArr?.length == 0) {
       throw new Error("Please Add Prodcuts.");
     }

    let productsArr = req.body?.productsArr;
    if (productsArr && productsArr?.length > 0) {
      for (const product of productsArr) {
        // for admin
        let productExits = await companyOrder?.productsArr.some((el) => el.productId == product.productId);
        
         if (productExits) {
          throw new Error(product.name + " Product is already exits.");
        } 

        let productObj = await Product.findOne({
          _id: newObjectId(product.productId),
        }).exec();
        if (productObj) {
          let newProductObjLogs = {
            productId: product.productId,
            brandId: productObj.brandId,
            colorId: productObj.colorId,
            sizeId: productObj.sizeId,
            name: product.name,
            price: product.price,
            msp: product.msp,
            gst: product.gst,
            quantity: 0,
            previousQuantity: product.quantity,
            currentQuantity: 0,
            leftQuantity: 0,
            orderedToId: companyOrder.orderedToId,
            orderedFromId: companyOrder.orderedFromId,
            batchId: companyOrder._id,
            status: ORDER_STATUS.PENDING,
            type: ORDER_TYPE.PURCHASE,
          };
          await createDocuments(CompanyOrderLogs, newProductObjLogs);
        }
      }

        await CompanyOrder.findOneAndUpdate(
          {
            _id: newObjectId(companyOrder._id),
          },
          { $push: { productsArr: productsArr } },
        ).exec();
    }


    
    res.status(200).json({ message: MESSAGE.PRODUCT.CREATED, data: companyOrder });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};


export const inhouseCompanyOrder = async (req: Request, res: Response, next: NextFunction) => {
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

    const newProduct = await createDocuments(CompanyOrder, newProductObj);

    res.status(200).json({ message: MESSAGE.PRODUCT.CREATED, data: newProduct });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const getCompanyOrder = async (req: Request, res: Response, next: NextFunction) => {
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
    if (req.query.sizeId || req.query.colorId || req.query.brandId) {
      matchObj["productsArr"] = {
        $elemMatch: {},
      };
    }
    if (req.query.sizeId && req.query.sizeId != "" && typeof req.query.sizeId == "string") {
      matchObj["productsArr"]["$elemMatch"]["sizeId"] = newObjectId(req.query.sizeId);
    }

    if (req.query.colorId && req.query.colorId != "" && typeof req.query.colorId == "string") {
      matchObj["productsArr"]["$elemMatch"]["colorId"] = newObjectId(req.query.colorId);
    }

    if (req.query.brandId && req.query.brandId != "" && typeof req.query.brandId == "string") {
      matchObj["productsArr"]["$elemMatch"]["brandId"] = newObjectId(req.query.brandId);
    }
    pipeline = [
 {
    $unwind: {
      path: "$productsArr",
      preserveNullAndEmptyArrays: false
    }
  },
  {
    $lookup: {
      from: "products",
      localField: "productsArr.productId",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    $unwind: {
      path: "$product",
      preserveNullAndEmptyArrays: false
    }
  },
  {
    $set: {
      "productsArr.sizeId": "$product.sizeId",
      "productsArr.colorId": "$product.colorId",
      "productsArr.brandId": "$product.brandId"
    }
  },
  {
    $unset: "product"
  },
  {
    $lookup: {
      from: "companyorderlogs",
      localField: "_id",
      foreignField: "batchId",
      as: "companyorders",
      let: {
        productId: "$productId"
      },
      pipeline: [
        {
          $group: {
            _id: "$productId",
            totalTransitItems: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "TRANSIT"]
                  },
                  "$quantity",
                  0
                ]
              }
            },
            totalStock: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "PENDING"]
                  },
                  "$previousQuantity",
                  0
                ]
              }
            },
            cancelledStock: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "CANCELLED"]
                  },
                  "$quantity",
                  0
                ]
              }
            }
          }
        }
      ]
    }
  },
  {
    $addFields: {
      totalTransitItems: {
        $sum: "$companyorders.totalTransitItems"
      },
      totalStock: {
        $sum: "$companyorders.totalStock"
      },
      cancelledStock: {
        $sum: "$companyorders.cancelledStock"
      }
    }
  },
  {
    $addFields: {
      totalStock: {
        $subtract: [
          "$totalStock",
          "$cancelledStock"
        ]
      },
      leftStock: {
        $subtract: [
          {
            $subtract: [
              "$totalStock",
              "$cancelledStock"
            ]
          },
          "$totalTransitItems"
        ]
      }
    }
  },
  {
    $group: {
      _id: "$_id",
      productsArr: {
        $push: "$productsArr"
      },
      name: {
        $first: "$name"
      },
      orderedFromId: {
        $first: "$orderedFromId"
      },
      orderedToId: {
        $first: "$orderedToId"
      },
      orderStatus: {
        $first: "$orderStatus"
      },
      statusArr: {
        $first: "$statusArr"
      },
      createdAt: {
        $first: "$createdAt"
      },
      updatedAt: {
        $first: "$updatedAt"
      },
      subTotal: {
        $first: "$subTotal"
      },
      total: {
        $first: "$total"
      },
      totalStock: {
        $first: "$totalStock"
      },
      leftStock: {
        $first: "$leftStock"
      },
      portName: {
        $first: "$portName"
      }
    }
  },
      {
        $match: matchObj,
      },

      { $sort: sortObj },
    ];

    /**
     * TODO Change to aggregation...
     */



    const paginatedProducts: any = await paginateAggregate(CompanyOrder, pipeline, req.query);

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

export const getCompanyOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attribute: any = await throwIfNotExist(
      CompanyOrder,
      { _id: newObjectId(req.params.id) },
      ERROR.PRODUCT.NOT_FOUND,
    );
    let pipleline = [
      {
        $match: {
          _id: newObjectId(req.params.id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "orderedFromId",
          foreignField: "_id",
          as: "sellerDetails",
        },
      },
      {
        $unwind: {
          path: "$sellerDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "orderedToId",
          foreignField: "_id",
          as: "buyerDetails",
        },
      },
      {
        $unwind: {
          path: "$buyerDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: "$productsArr",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          productId: "$productsArr.productId",
        },
      },
      {
        $lookup: {
          from: "companyorderlogs",
          localField: "_id",
          foreignField: "batchId",
          as: "orders",
          let: {
            productId: "$productId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productId", "$$productId"],
                },
              },
            },
            {
              $addFields: {
                totalTransitItems: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$status", "TRANSIT"],
                      },
                      "$quantity",
                      0,
                    ],
                  },
                },
                totalStock: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$status", "PENDING"],
                      },
                      "$previousQuantity",
                      0,
                    ],
                  },
                },
                cancelledStock: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$status", "CANCELLED"],
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
        $set: {
          "productsArr.orders": "$orders",
          "productsArr.totalTransitItems": {
            $sum: "$orders.totalTransitItems",
          },
          "productsArr.totalStock": {
            $sum: "$orders.totalStock",
          },
          "productsArr.cancelledStock": {
            $sum: "$orders.cancelledStock",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          discountValue: {
            $first: "$discountValue",
          },
          subTotal: {
            $first: "$subTotal",
          },
          orderedFromId: {
            $first: "$orderedFromId",
          },
          sellerDetails: {
            $first: "$sellerDetails",
          },
          buyerDetails: {
            $first: "$buyerDetails",
          },
          orderedToId: {
            $first: "$orderedToId",
          },
          total: {
            $first: "$total",
          },
          statusArr: {
            $first: "$statusArr",
          },
          createdAt: {
            $first: "$createdAt",
          },
          updatedAt: {
            $first: "$updatedAt",
          },
          productsArr: {
            $push: "$productsArr",
          },
        },
      },
    ];

    let companyOrder: any = await CompanyOrder.aggregate(pipleline);

    if (companyOrder?.length > 0) {
      companyOrder = companyOrder[0];
    }
    res.status(200).json({ message: MESSAGE.PRODUCT.GOTBYID, data: companyOrder });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const updateCompanyOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.params.id, "ID");
    let { status } = req.body;
    if (!req.params.id) throw new Error("Can't find order.");
    const updatedObj: any = {};

    let companyOrder = await CompanyOrder.findById(req.params.id).lean().exec();
    if (!companyOrder) {
      throw new Error("Can't find order.");
    }
    if (req.body.quantity) {
      let productObj = companyOrder.productsArr.find((el) => el.productId == req.body.productId);

      let companyLogObjs: any = await CompanyOrderLogs.find({
        productId: newObjectId(req.body.productId),
        batchId: newObjectId(companyOrder?._id),
      })
        .sort({ createdAt: -1 })
        .limit(1);

      console.log(companyLogObjs, "companyLogObjscompanyLogObjscompanyLogObjscompanyLogObjs");
      
       
      if (productObj && companyLogObjs?.length > 0) {
        companyLogObjs = companyLogObjs[0];
        if (Number(companyLogObjs.previousQuantity) <= 0) {
          throw new Error("Stock is Complete");
        }
        if (Number(companyLogObjs.currentQuantity + req.body.quantity) > Number(productObj?.quantity)) {
          throw new Error("Quantity is more than stock.");
        }

      
        if (req.body.status == PRODUCT_STATUS.CANCELLED) {
          let newProductObjLogs = {
            productId: companyLogObjs.productId,
            brandId: companyLogObjs.brandId,
            colorId: companyLogObjs.colorId,
            sizeId: companyLogObjs.sizeId,
            name: companyLogObjs.name,
            price: companyLogObjs.price,
            msp: companyLogObjs.msp,
            gst: companyLogObjs.gst,
            quantity: req.body.quantity,
            previousQuantity: companyLogObjs.previousQuantity - req.body.quantity,
            currentQuantity: companyLogObjs.currentQuantity,
            orderedToId: companyLogObjs.orderedToId,
            orderedFromId: companyLogObjs.orderedFromId,
            batchId: companyLogObjs.batchId,
            status: req.body.status,
            type: ORDER_TYPE.PURCHASE,
          };
          await createDocuments(CompanyOrderLogs, newProductObjLogs);

       companyOrder =    await CompanyOrder.findOneAndUpdate(
            { "productsArr.productId": newObjectId(req.body.productId), _id: newObjectId(req.params.id) },
            {  $inc: { "productsArr.$.quantity": -req.body.quantity }  },{new:true}
          );
        } else {
          let newProductObjLogs = {
            productId: companyLogObjs.productId,
            brandId: companyLogObjs.brandId,
            colorId: companyLogObjs.colorId,
            sizeId: companyLogObjs.sizeId,
            name: companyLogObjs.name,
            price: companyLogObjs.price,
            msp: companyLogObjs.msp,
            gst: companyLogObjs.gst,
            quantity: req.body.quantity,
            previousQuantity: companyLogObjs.previousQuantity - req.body.quantity,
            currentQuantity: companyLogObjs.currentQuantity + req.body.quantity,
            orderedToId: companyLogObjs.orderedToId,
            orderedFromId: companyLogObjs.orderedFromId,
            batchId: companyLogObjs.batchId,
            status: req.body.status,
            type: ORDER_TYPE.PURCHASE,
          };
          await createDocuments(CompanyOrderLogs, newProductObjLogs);
        }
      }

      let companyOrderTotal: any = await CompanyOrderLogs.aggregate([
        {
          $match: {
            productId: newObjectId(req.body.productId),
            batchId: newObjectId(companyOrder?._id),
            status:PRODUCT_STATUS.TRANSIT
          },
        },
        {
          $group: {
            _id: "$productId",
            totalQuantity: {
              $sum: "$quantity",
            },
          },
        },
      ]);
      if (companyOrderTotal?.length > 0 && companyOrder) {
        companyOrderTotal = companyOrderTotal[0];
        let productObj = companyOrder.productsArr.find((el) => el.productId == req.body.productId);

        if (companyOrderTotal.totalQuantity == Number(productObj?.quantity)) {
       companyOrder =   await CompanyOrder.findOneAndUpdate(
            { "productsArr.productId": newObjectId(req.body.productId), _id: newObjectId(req.params.id) },
            { $set: { "productsArr.$.status": ORDER_STATUS.DELIVERED } },
          {new:true})
        }


        
      }

      
                    if (companyOrder && companyOrder.productsArr.some((el) => el.status == ORDER_STATUS.DELIVERED)) {
                            let today = new Date();

                      let updateStta: any = {
                        orderStatus: {
                          currentStatus: ORDER_STATUS.DELIVERED,
                          on: today,
                        },
                      };
                      let statseArrr = companyOrder?.statusArr;
                      statseArrr.push({
                        status: ORDER_STATUS.DELIVERED,
                        on: today,
                      });
                      updateStta.statusArr = statseArrr;
                      await CompanyOrder.findOneAndUpdate(
                        {
                          _id: newObjectId(companyOrder._id),
                        },
                        updateStta,
                      ).exec();
                    }
    }

    res.status(200).json({ message: MESSAGE.PRODUCT.UPDATED });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};
export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.params.id, "ID");
    let { status } = req.body;
    if (!req.params.id) throw new Error("Can't find order.");
    const updatedObj: any = {};

    const companyOrder = await CompanyOrderLogs.findById(req.params.id).lean().exec();
    if (!companyOrder) {
      throw new Error("Can't find order.");
    }
    let updateStatus: any = {
      status: req.body?.status,
    };
    if (req.body?.status == ORDER_STATUS.DELIVERED) {
      updateStatus.leftQuantity = companyOrder?.currentQuantity;
    }

    await CompanyOrderLogs.findByIdAndUpdate(companyOrder._id, updateStatus).exec();

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

    let matchObj: Record<string, any> = { totalQuantity :{$gt:0}};
    let sortObj: Record<string, any> = {name:1};
    let pipeline: PipelineStage[] = [];

  

   

    // if (req.user?.userObj?.role != ROLES.ADMIN) {
    //   matchObj.orderedToId = req.user?.userObj?._id;
    // }


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
        $unwind: {
          path: "$productsArr",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          productStatus: "$productsArr.status",
          productId: "$productsArr.productId",
          totalQuantity: "$productsArr.quantity",
          name: "$productsArr.name",
        },
      },
      {
        $match: {
          productStatus: {
            $ne: "DELIVERED",
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "products",
        },
      },
      {
        $unwind: {
          path: "$products",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          colorId: "$products.colorId",
          sizeId: "$products.sizeId",
          brandId: "$products.brandId",
          packet: "$products.packet",
          box: "$products.box",
        },
      },
      {
        $lookup: {
          from: "companyorderlogs",
          localField: "productId",
          foreignField: "productId",
          as: "companyorders",
          let: {
            productId: "$productId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productId", "$$productId"],
                },
              },
            },
            {
              $group: {
                _id: "$productId",
                totalTransitItems: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$status", "TRANSIT"],
                      },
                      "$quantity",
                      0,
                    ],
                  },
                },
                totalStock: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$status", "PENDING"],
                      },
                      "$previousQuantity",
                      0,
                    ],
                  },
                },
                cancelledStock: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$status", "CANCELLED"],
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
          path: "$companyorders",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          totalTransitItems: "$companyorders.totalTransitItems",
          totalStock: {
            $subtract: ["$companyorders.totalStock", "$companyorders.cancelledStock"],
          },
        },
      },
      {
        $group: {
          _id: "$productId",
          productId: {
            $first: "$productId",
          },
          name: {
            $first: "$name",
          },
          colorId: {
            $first: "$colorId",
          },
          sizeId: {
            $first: "$sizeId",
          },
          brandId: {
            $first: "$brandId",
          },
            box: {
            $first: "$box",
          },
          packet: {
            $first: "$packet",
          },
          totalQuantity: {
            $first: "$totalStock",
          },
          totalTransitItems: {
            $first: "$totalTransitItems",
          },
        },
      },
      {
        $match: matchObj,
      },

      { $sort: sortObj },
    ];

    /**
     * TODO Change to aggregation...
     */

    // pipeline.push({ $sort: sortObj });

    const paginatedProducts: any = await paginateAggregate(CompanyOrder, pipeline, req.query);

 
    res
      .status(200)
      .json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: paginatedProducts.data, total: paginatedProducts.total });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const getAllProductStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = {};
    let sortObj: Record<string, any> = {};
    let pipeline: PipelineStage[] = [];

    console.log(req.query, "QUERY IN GET PRODUCTS");
    console.log(req.query, "QUERY.......");

    let StockObj: any = {};

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
                        $eq: ["$type", "PURCHASE"],
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
                        $eq: ["$type", "SELL"],
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

export const getStockByProductId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = {
      
    };
    let sortObj: Record<string, any> = {createdAt:-1};
    let pipeline: PipelineStage[] = [];

    console.log(req.query, "QUERY IN GET PRODUCTS");
    console.log(req.query, "QUERY.......");

    let StockObj: any = {};

    if (req.params.id) {
         matchObj.productId = newObjectId(req.params.id)  ;
    }

    pipeline = [
      {
        $match: matchObj,
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

    /**
     * TODO Change to aggregation...
     */

    // pipeline.push({ $sort: sortObj });

    const paginatedProducts: any = await paginateAggregate(CompanyOrderLogs, pipeline, req.query);

    res
      .status(200)
      .json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: paginatedProducts.data, total: paginatedProducts.total });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const getOrderByProductId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = {};
    let sortObj: Record<string, any> = { createdAt: -1 };
    let pipeline: PipelineStage[] = [];

    console.log(req.query, "QUERY IN GET PRODUCTS");
    console.log(req.query, "QUERY.......");

    let StockObj: any = {};

    if (req.params.id) {
      matchObj.productId = newObjectId(req.params.id);
    }

    pipeline = [
      {
        $unwind: {
          path: "$productsArr",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          productId: "$productsArr.productId",
          productStatus: "$productsArr.status",
          totalQuantity: "$productsArr.quantity",
          name: "$productsArr.name",
          price: "$productsArr.price",
        },
      },
      {
        $match: {
          productId: newObjectId(req.params.id),
          status: {
            $ne: "DELIVERED",
          },
        },
      },
      {
        $lookup: {
          from: "companyorderlogs",
          localField: "_id",
          foreignField: "batchId",
          as: "companyorders",
          let: {
            productId: "$productId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productId", "$$productId"],
                },
              },
            },
            {
              $group: {
                _id: "$productId",
                totalStockItems: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          {
                            $eq: ["$status", "TRANSIT"],
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
          path: "$companyorders",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          totalStockItems: "$companyorders.totalStockItems",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    /**
     * TODO Change to aggregation...
     */

    // pipeline.push({ $sort: sortObj });

    const paginatedProducts: any = await paginateAggregate(CompanyOrder, pipeline, req.query);

    res
      .status(200)
      .json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: paginatedProducts.data, total: paginatedProducts.total });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

