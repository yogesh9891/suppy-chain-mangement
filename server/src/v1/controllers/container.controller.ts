import { LOAD_TYPE, ORDER_STATUS, ORDER_TYPE, PRODUCT_STATUS, ROLE_STATUS, ROLES, STOCK } from "common/constant.common";
import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";

import {
  createDocuments,
  findById,
  findByIdAndUpdate,
  findOne,
  newObjectId,
  throwIfExist,
  throwIfNotExist,
} from "utils/mongoQueries";
import { newRegExp } from "utils/regex";
import { Container, IContainer } from "models/container.model";
import { IUser, User } from "models/user.model";
import { PipelineStage, Types } from "mongoose";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose from "mongoose";
import { Box } from "models/box.model";
import { ProductStock } from "models/productStock.model";
import stateRouter from "v1/routes/state.routes";
import { CompanyOrderLogs } from "models/companyOrderLogs.model";
import { Product } from "models/product.model";
import { CompanyOrder } from "models/companyOrder.model";
import {  WareHouseStock } from "models/wareHouseStock.model";
import { WareHouseLogs } from "models/wareHouseLogs.model";

export const createContainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body, "body = PRODUCT CONTROLLER");

    let storeId = req.user?.userObj?._id;

    const seller = await throwIfNotExist(User, { _id: newObjectId(storeId), isDeleted: false }, ERROR.USER.NOT_FOUND);

    const { productsArr, subTotal, total, userId, status } = req.body;
    let type = ORDER_TYPE.PURCHASE;
    req.body.orderedFromId = storeId;
    let today = new Date();
    let currentStatus = status ? status : ORDER_STATUS.TRANSIT;
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
    req.body.type = LOAD_TYPE.CONTAINER;

    const newProductObj: any = {
      ...req.body,
      // categoryIdArr: parentCatIdArr,
    };

    if (productsArr && productsArr?.length > 0) {
      for (const product of productsArr) {
        if (product?.type == LOAD_TYPE.WAREHOUSE) {
          if (product && product?.productId) {
                  let warehouseStockObj  =  await WareHouseStock.findOneAndUpdate(
                        {
                          productId: newObjectId(product.productId),
                        }
                      ).exec();

                        if (warehouseStockObj && warehouseStockObj?._id) {
                          /// add Warehouse Logs
                          let newWarehOuseLogs = {
                            productId: product.productId,
                            name: product.name,
                            price: product.price,
                            msp: product.msp,
                            gst: product.gst,
                            quantity: product.quantity,
                            previousQuantity: warehouseStockObj?.quantity,
                            currentQuantity: warehouseStockObj?.quantity - product.quantity,
                            status: STOCK.STOCK_OUT,
                          };
                          await new WareHouseLogs(newWarehOuseLogs).save();
                            warehouseStockObj = await WareHouseStock.findOneAndUpdate(
                             {
                               productId: newObjectId(product.productId),
                             },
                             { $inc: { quantity: -product.quantity } },
                           ).exec();
                        }
          }
        } else {
        
          // for admin
          let fulfilledQuantity = 0;
          let qunatity = product.quantity;
          let skip = 0;
          while (qunatity != fulfilledQuantity) {
            let companyOrder = await CompanyOrder.findOne({
              "productsArr.": { $elemMatch: { status: "PENDING", productId: newObjectId(product.productId) } },
            }).exec();
            if (companyOrder) {
              console.log(JSON.stringify(companyOrder, null, 2), "companyOrder", qunatity);
              let productObj = companyOrder?.productsArr.find((el) => el.productId == product.productId);
              console.log(JSON.stringify(productObj, null, 2), "productObj");
              let companyLogObjs: any = await CompanyOrderLogs.find({
                productId: newObjectId(product.productId),
                batchId: newObjectId(companyOrder?._id),
                previousQuantity: { $gt: 0 },
              })
                .sort({ createdAt: -1 })
                .limit(1)
                .exec();

              console.log(
                JSON.stringify(companyLogObjs, null, 2),
                "companyLogObjscompanyLogObjscompanyLogObjscompanyLogObjs",
                qunatity,
              );
              if (productObj && companyLogObjs?.length > 0) {
                companyLogObjs = companyLogObjs[0];
                let updateQaunty = 0;

                if (companyLogObjs.previousQuantity < qunatity - fulfilledQuantity) {
                  if (productObj) {
                    let newProductObjLogs = {
                      productId: product.productId,
                      brandId: product.brandId,
                      colorId: product.colorId,
                      sizeId: product.sizeId,
                      name: productObj.name,
                      price: productObj.price,
                      msp: productObj.msp,
                      gst: productObj.gst,
                      quantity: companyLogObjs.previousQuantity,
                      previousQuantity: 0,
                      currentQuantity: companyLogObjs.currentQuantity + companyLogObjs.previousQuantity,
                      orderedToId: companyLogObjs.orderedToId,
                      orderedFromId: companyLogObjs.orderedFromId,
                      batchId: companyLogObjs.batchId,
                      status: PRODUCT_STATUS.TRANSIT,
                      type: ORDER_TYPE.PURCHASE,
                    };


                    updateQaunty = companyLogObjs.previousQuantity;
                    await new CompanyOrderLogs(newProductObjLogs).save();

                    fulfilledQuantity = fulfilledQuantity + companyLogObjs.previousQuantity;

                    console.log(qunatity, "qunatityqunatityqunatityqunatityqunatityqunatityqunatity1");
                  }
                } else {
                  if (productObj) {
                    let newProductObjLogs = {
                      productId: product.productId,
                      brandId: product.brandId,
                      colorId: product.colorId,
                      sizeId: product.sizeId,
                      name: productObj.name,
                      price: productObj.price,
                      msp: productObj.msp,
                      gst: productObj.gst,
                      quantity: qunatity - fulfilledQuantity,
                      previousQuantity: companyLogObjs.previousQuantity - (qunatity - fulfilledQuantity),
                      currentQuantity: companyLogObjs.currentQuantity + (qunatity - fulfilledQuantity),
                      orderedToId: companyLogObjs.orderedToId,
                      orderedFromId: companyLogObjs.orderedFromId,
                      batchId: companyLogObjs.batchId,
                      status: PRODUCT_STATUS.TRANSIT,
                      type: ORDER_TYPE.PURCHASE,
                    };
                    await new CompanyOrderLogs(newProductObjLogs).save();
                    updateQaunty = qunatity;
                    fulfilledQuantity = fulfilledQuantity + (qunatity - fulfilledQuantity);
                    console.log(qunatity, "qunatityqunatityqunatityqunatityqunatityqunatityqunatity2");
                  }
                }

                let containerTotal: any = await CompanyOrderLogs.aggregate([
                  {
                    $match: {
                      productId: newObjectId(product.productId),
                      batchId: newObjectId(companyOrder?._id),
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

                console.log(JSON.stringify(containerTotal, null, 2), "containerTotal");
                if (containerTotal?.length > 0) {
                  containerTotal = containerTotal[0];
                  console.log(
                    containerTotal.totalQuantity,
                    "containerTotal.totalQuantity",
                    Number(productObj?.quantity),
                    "Number(productObj?.quantity)",
                  );
                  if (containerTotal.totalQuantity == Number(productObj?.quantity)) {
                  companyOrder =  await CompanyOrder.findOneAndUpdate(
                      {
                        "productsArr.productId": newObjectId(product.productId),
                        _id: newObjectId(companyOrder._id),
                      },
                      { $set: { "productsArr.$.status": ORDER_STATUS.DELIVERED } },
                      { new: true },
                    ).exec();
                  }
                  await delay();
                }

                    if (companyOrder && companyOrder.productsArr.some((el) => el.status == ORDER_STATUS.DELIVERED)) {
                      let updateStta: any = {
                        orderStatus: {
                          currentStatus: "COMPLETE",
                          on: today,
                        },
                      };
                      let statseArrr = companyOrder?.statusArr;
                      statseArrr.push({
                        status: "COMPLETE",
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
            } else {
              fulfilledQuantity = qunatity;
            }
          }
        }
      }
    }
    const newProduct = await createDocuments(Container, newProductObj);

    res.status(200).json({ message: MESSAGE.PRODUCT.CREATED, data: newProduct });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const createWareHouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body, "body = PRODUCT CONTROLLER");

    let storeId = req.user?.userObj?._id;

    const seller = await throwIfNotExist(User, { _id: newObjectId(storeId), isDeleted: false }, ERROR.USER.NOT_FOUND);

    const { productsArr, subTotal, total, userId, status } = req.body;
    let type = ORDER_TYPE.PURCHASE;
    req.body.orderedFromId = storeId;
    let today = new Date();
    let currentStatus = status ? status : ORDER_STATUS.TRANSIT;
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
    req.body.type = LOAD_TYPE.WAREHOUSE;
    const newProductObj: any = {
      ...req.body,
      // categoryIdArr: parentCatIdArr,
    };

    if (productsArr && productsArr?.length > 0) {
      for (const product of productsArr) {
        // for admin
        let fulfilledQuantity = 0;
        let qunatity = product.quantity;
        let skip = 0;
        while (qunatity != fulfilledQuantity) {
          let companyOrder = await CompanyOrder.findOne({
            "productsArr.": { $elemMatch: { status: "PENDING", productId: newObjectId(product.productId) } },
          }).exec();
          if (companyOrder) {
            console.log(JSON.stringify(companyOrder, null, 2), "companyOrder", qunatity);
            let productObj = companyOrder?.productsArr.find((el) => el.productId == product.productId);
            console.log(JSON.stringify(productObj, null, 2), "productObj");
            let companyLogObjs: any = await CompanyOrderLogs.find({
              productId: newObjectId(product.productId),
              batchId: newObjectId(companyOrder?._id),
              previousQuantity: { $gt: 0 },
            })
              .sort({ createdAt: -1 })
              .limit(1)
              .exec();

            console.log(
              JSON.stringify(companyLogObjs, null, 2),
              "companyLogObjscompanyLogObjscompanyLogObjscompanyLogObjs",
              qunatity,
            );
            if (productObj && companyLogObjs?.length > 0) {
              companyLogObjs = companyLogObjs[0];
              let updateQaunty = 0;

              if (companyLogObjs.previousQuantity < qunatity - fulfilledQuantity) {
                if (productObj) {
                  let newProductObjLogs = {
                    productId: product.productId,
                    brandId: product.brandId,
                    colorId: product.colorId,
                    sizeId: product.sizeId,
                    name: productObj.name,
                    price: productObj.price,
                    msp: productObj.msp,
                    gst: productObj.gst,
                    quantity: companyLogObjs.previousQuantity,
                    previousQuantity: 0,
                    currentQuantity: companyLogObjs.currentQuantity + companyLogObjs.previousQuantity,
                    orderedToId: companyLogObjs.orderedToId,
                    orderedFromId: companyLogObjs.orderedFromId,
                    batchId: companyLogObjs.batchId,
                    status: PRODUCT_STATUS.TRANSIT,
                    type: ORDER_TYPE.PURCHASE,
                    containerType: LOAD_TYPE.WAREHOUSE,
                  };

                  await new CompanyOrderLogs(newProductObjLogs).save();
                  updateQaunty = companyLogObjs.previousQuantity;
                  fulfilledQuantity = fulfilledQuantity + companyLogObjs.previousQuantity;

                  console.log(qunatity, "qunatityqunatityqunatityqunatityqunatityqunatityqunatity1");
                }
              } else {
                if (productObj) {
                  /// remove from purchase Order
                  let newProductObjLogs = {
                    productId: product.productId,
                    brandId: product.brandId,
                    colorId: product.colorId,
                    sizeId: product.sizeId,
                    name: productObj.name,
                    price: productObj.price,
                    msp: productObj.msp,
                    gst: productObj.gst,
                    quantity: qunatity - fulfilledQuantity,
                    previousQuantity: companyLogObjs.previousQuantity - (qunatity - fulfilledQuantity),
                    currentQuantity: companyLogObjs.currentQuantity + (qunatity - fulfilledQuantity),
                    orderedToId: companyLogObjs.orderedToId,
                    orderedFromId: companyLogObjs.orderedFromId,
                    batchId: companyLogObjs.batchId,
                    status: PRODUCT_STATUS.TRANSIT,
                    type: ORDER_TYPE.PURCHASE,
                  };
                  await new CompanyOrderLogs(newProductObjLogs).save();

                  fulfilledQuantity = fulfilledQuantity + (qunatity - fulfilledQuantity);
                  updateQaunty = qunatity;
                }
              }

              let containerTotal: any = await CompanyOrderLogs.aggregate([
                {
                  $match: {
                    productId: newObjectId(product.productId),
                    batchId: newObjectId(companyOrder?._id),
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

              console.log(JSON.stringify(containerTotal, null, 2), "containerTotal");
              if (containerTotal?.length > 0) {
                containerTotal = containerTotal[0];
                console.log(
                  containerTotal.totalQuantity,
                  "containerTotal.totalQuantity",
                  Number(productObj?.quantity),
                  "Number(productObj?.quantity)",
                );
                if (containerTotal.totalQuantity == Number(productObj?.quantity)) {
                  companyOrder = await CompanyOrder.findOneAndUpdate(
                    {
                      "productsArr.productId": newObjectId(product.productId),
                      _id: newObjectId(companyOrder._id),
                    },
                    { $set: { "productsArr.$.status": ORDER_STATUS.DELIVERED } },
                  ).exec();
                }
                // if (companyOrder && companyOrder.productsArr.some((el) => el.status == ORDER_STATUS.DELIVERED)) {
                //   let updateStta:any = {
                //     orderStatus : {
                //        currentStatus:ORDER_STATUS.DELIVERED,
                //        on: today,
                //      }
                //   }
                //   let statseArrr = companyOrder?.statusArr;
                //     statseArrr.push({
                //       status: ORDER_STATUS.DELIVERED,
                //       on: today,
                //     });
                //      updateStta.statusArr = statseArrr;
                //      await CompanyOrder.findOneAndUpdate(
                //        {
                //          _id: newObjectId(companyOrder._id),
                //        },
                //        updateStta,
                //      ).exec();
                // }

                await delay();
              }

              // Add WAreHouse Stock

              let warehouseStockObj = await WareHouseStock.findOne({
                productId: newObjectId(product.productId),
              }).exec();

              let prevousWarehouseQuantity = 0;
              if (warehouseStockObj && warehouseStockObj?.productId) {
                prevousWarehouseQuantity = warehouseStockObj?.quantity;
              warehouseStockObj =  await WareHouseStock.findOneAndUpdate(
                  {
                    productId: newObjectId(product.productId),
                  },
                  { $inc: { quantity: updateQaunty } },
                ).exec();
              } else {
                let newWareHouseStock = {
                  productId: product.productId,
                  brandId: product.brandId,
                  colorId: product.colorId,
                  sizeId: product.sizeId,
                  name: productObj.name,
                  price: productObj.price,
                  msp: productObj.msp,
                  gst: productObj.gst,
                  quantity: updateQaunty,
                  orderedToId: companyLogObjs.orderedToId,
                  orderedFromId: companyLogObjs.orderedFromId,
                  status: PRODUCT_STATUS.TRANSIT,
                  type: ORDER_TYPE.PURCHASE,
                };
                warehouseStockObj = await new WareHouseStock(newWareHouseStock).save();
              }

              //add warehiuse logs
              console.log(warehouseStockObj, warehouseStockObj?.productId,"ddddd---------------------------------------");
              if (warehouseStockObj && warehouseStockObj?.productId) {
                /// add Warehouse Logs
                let newWarehOuseLogs = {
                  productId: product.productId,
                  name: productObj.name,
                  price: productObj.price,
                  msp: productObj.msp,
                  gst: productObj.gst,
                  quantity: updateQaunty,
                  previousQuantity: prevousWarehouseQuantity,
                  currentQuantity: prevousWarehouseQuantity + updateQaunty,
                  orderedToId: companyLogObjs.orderedToId,
                  orderedFromId: companyLogObjs.orderedFromId,
                  batchId: companyLogObjs.batchId,
                  status: STOCK.STOCK_IN,
                };
                await new WareHouseLogs(newWarehOuseLogs).save();
              }

                 if (companyOrder && companyOrder.productsArr.some((el) => el.status == ORDER_STATUS.DELIVERED)) {
                   let updateStta: any = {
                     orderStatus: {
                       currentStatus: "COMPLETE",
                       on: today,
                     },
                   };
                   let statseArrr = companyOrder?.statusArr;
                   statseArrr.push({
                     status: "COMPLETE",
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
          } else {
            fulfilledQuantity = qunatity;
          }
        }
      }
    }
    const newProduct = await createDocuments(Container, newProductObj);

    res.status(200).json({ message: MESSAGE.PRODUCT.CREATED, data: newProduct });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};
function delay() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 100);
  });
}

export const getContainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "QUERY IN GET PRODUCTS");
    console.log(req.query, "QUERY.......");

    let matchObj: Record<string, any> = { type: "CONTAINER" };
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

       if (req.query.type) {
      matchObj.type = req.query.type;
    }
   

    if (req.query.orderedToId && req.query.orderedToId != "") {
      matchObj.orderedToId = newObjectId(req.query.orderedToId);
    }
    if (req.query.orderedFromId && req.query.orderedFromId != "") {
      matchObj.orderedFromId = newObjectId(req.query.orderedFromId);
    }
    if (req.query.sizeId || req.query.colorId || req.query.brandId) {
      matchObj["productsArr"] = {
        $elemMatch: {  },
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
      "productsArr.brandId": "$product.brandId",
      stock: "$productsArr.quantity"
    }
  },
  {
    $unset: "product"
  },
  {
    $group: {
      _id: "$_id",
      productsArr: {
        $push: "$productsArr"
      },
      stock: {
        $sum: "$stock"
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
      portId: {
        $first: "$portId"
      },
      portName: {
        $first: "$portName"
      },
      type: {
        $first: "$type"
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


    const paginatedProducts: any = await paginateAggregate(Container, pipeline, req.query);

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

export const getContainerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attribute: any = await throwIfNotExist(
      Container,
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
      // {
      //   $lookup: {
      //     from: "companyorderlogs",
      //     localField: "_id",
      //     foreignField: "batchId",
      //     as: "orders",
      //     let: {
      //       productId: "$productId",
      //     },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $eq: ["$productId", "$$productId"],
      //           },
      //         },
      //       },
      //     ],
      //   },
      // },
      // {
      //   $set: {
      //     "productsArr.orders": "$orders",
      //   },
      // },
      {
        $group: {
          _id: "$_id",
          discountValue: {
            $first: "$discountValue",
          },
          name: {
            $first: "$name",
          },
          orderStatus: {
            $first: "$orderStatus",
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
          type: {
            $first: "$type",
          },
          portId: {
            $first: "$portId",
          },
          portName: {
            $first: "$portName",
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

    let container: any = await Container.aggregate(pipleline);

    if (container?.length > 0) {
      container = container[0];
    }
    res.status(200).json({ message: MESSAGE.PRODUCT.GOTBYID, data: container });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const updateContainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.params.id, "ID");
    let { status } = req.body;
    if (!req.params.id) throw new Error("Can't find order.");
    const updatedObj: any = {};

    const container = await Container.findById(req.params.id).lean().exec();
    if (!container) {
      throw new Error("Can't find order.");
    }
    // if (req.body.quantity) {
    //   let productObj = container.productsArr.find((el) => el.productId == req.body.productId);

    //   let companyLogObjs: any = await CompanyOrderLogs.find({
    //     productId: newObjectId(req.body.productId),
    //     batchId: newObjectId(container?._id),
    //   })
    //     .sort({ createdAt: -1 })
    //     .limit(1);

    //   console.log(companyLogObjs, "companyLogObjscompanyLogObjscompanyLogObjscompanyLogObjs");
    //   if (productObj && companyLogObjs?.length > 0) {
    //     companyLogObjs = companyLogObjs[0];

    //     if (Number(companyLogObjs.currentQuantity + req.body.quantity) > Number(productObj?.quantity)) {
    //       throw new Error("Quantity is more than stock.");
    //     }

    //     let newProductObjLogs = {
    //       productId: companyLogObjs.productId,
    //       brandId: companyLogObjs.brandId,
    //       colorId: companyLogObjs.colorId,
    //       sizeId: companyLogObjs.sizeId,
    //       name: companyLogObjs.name,
    //       price: companyLogObjs.price,
    //       msp: companyLogObjs.msp,
    //       gst: companyLogObjs.gst,
    //       quantity: req.body.quantity,
    //       previousQuantity: companyLogObjs.previousQuantity - req.body.quantity,
    //       currentQuantity: companyLogObjs.currentQuantity + req.body.quantity,
    //       orderedToId: companyLogObjs.orderedToId,
    //       orderedFromId: companyLogObjs.orderedFromId,
    //       batchId: companyLogObjs.batchId,
    //       status: req.body.status,
    //       type: ORDER_TYPE.PURCHASE,
    //     };
    //     await createDocuments(CompanyOrderLogs, newProductObjLogs);
    //   }

    //   let containerTotal: any = await CompanyOrderLogs.aggregate([
    //     {
    //       $match: {
    //         productId: newObjectId(req.body.productId),
    //         batchId: newObjectId(container?._id),
    //       },
    //     },
    //     {
    //       $group: {
    //         _id: "$productId",
    //         totalQuantity: {
    //           $sum: "$quantity",
    //         },
    //       },
    //     },
    //   ]);
    //   if (containerTotal?.length > 0) {
    //     containerTotal = containerTotal[0];
    //     if (containerTotal.totalQuantity == Number(productObj?.quantity)) {
    //       await Container.findOneAndUpdate(
    //         { "productsArr.productId": newObjectId(req.body.productId), _id: newObjectId(req.params.id) },
    //         { $set: { "productsArr.$.status": ORDER_STATUS.DELIVERED } },
    //       );
    //     }
    //   }
    // }
    let today = new Date();
    let currentStatus = status ? status : ORDER_STATUS.TRANSIT;
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
    await findByIdAndUpdate<IContainer>(Container, newObjectId(req.params.id), newProductObj, {
      new: true,
    });

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

    const container = await CompanyOrderLogs.findById(req.params.id).lean().exec();
    if (!container) {
      throw new Error("Can't find order.");
    }
    let updateStatus: any = {
      status: req.body?.status,
    };
    if (req.body?.status == ORDER_STATUS.DELIVERED) {
      updateStatus.leftQuantity = container?.currentQuantity;
    }

    await CompanyOrderLogs.findByIdAndUpdate(container._id, updateStatus).exec();

    res.status(200).json({ message: MESSAGE.PRODUCT.UPDATED });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};



export const getWareHouseStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "QUERY IN GET PRODUCTS");
    console.log(req.query, "QUERY.......");

    let matchObj: Record<string, any> = { quantity:{$gt:0}};
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
        matchObj.sizeId = newObjectId(req.query.size);
     }

     if (req.query.color && req.query.color != "" && typeof req.query.color == "string") {
        matchObj.colorId = newObjectId(req.query.color);
     }

     if (req.query.brand && req.query.brand != "" && typeof req.query.brand == "string") {
        matchObj.brandId = newObjectId(req.query.brand);
     }
    pipeline = [
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $set: {
          sizeId: "$product.sizeId",
          colorId: "$product.colorId",
          brandId: "$product.brandId",
          box: "$product.box",
          packet: "$product.packet",
        },
      },
      {
        $unset: "product",
      },
      {
        $match: matchObj,
      },
    ];


    /**
     * TODO Change to aggregation...
     */

    // pipeline.push({ $sort: sortObj });

    const paginatedProducts: any = await paginateAggregate(WareHouseStock, pipeline, req.query);

    res
      .status(200)
      .json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: paginatedProducts.data, total: paginatedProducts.total });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const getWareHouseStockSlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "QUERY IN GET PRODUCTS");
    console.log(req.query, "QUERY.......");

    let matchObj: Record<string, any> = { productId: newObjectId(req.query.productId) };
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
    // let StockObj: any = {};
    // if (req.query.orderedFromId) {
    //   matchObj.orderedFromId = newObjectId(req.query.orderedFromId);
    //   StockObj.orderedFromId = newObjectId(req.query.orderedFromId);
    // }

    // if (req.query.orderedToId && !req.query.stock) {
    //   matchObj.orderedToId = newObjectId(req.query.orderedToId);
    //   StockObj.orderedToId = newObjectId(req.query.orderedToId);
    // }

    // if (req.query.size && req.query.size != "" && typeof req.query.size == "string") {
    //   matchObj.sizeId = newObjectId(req.query.size);
    // }

    // if (req.query.color && req.query.color != "" && typeof req.query.color == "string") {
    //   matchObj.colorId = newObjectId(req.query.color);
    // }

    // if (req.query.brand && req.query.brand != "" && typeof req.query.brand == "string") {
    //   matchObj.brandId = newObjectId(req.query.brand);
    // }
    pipeline = [
      {
        $match: matchObj,
      },
    ];

    /**
     * TODO Change to aggregation...
     */

    // pipeline.push({ $sort: sortObj });

    const paginatedProducts: any = await paginateAggregate(WareHouseLogs, pipeline, req.query);

    res
      .status(200)
      .json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: paginatedProducts.data, total: paginatedProducts.total });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};