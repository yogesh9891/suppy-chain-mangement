import { BARCODE_TYPE } from "common/constant.common";
import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { generateBarCodeWithValue } from "helpers/barCode";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Area } from "models/area.model";
import { BarCode } from "models/barcode.model";
import { Brand, IBrand } from "models/brand.model";
import { Category, ICategory } from "models/category.model";
import { IProduct, Product } from "models/product.model";
import { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body, "body = PRODUCT CONTROLLER");

    const {
      name,
      brandId,
      colorId,
      sizeId,
      description,
      categoryArr,
      skuCode,
      hsnCode,
      thumbnail,
      imagesArr,
      attributeArr,
    } = req.body;

    const requiredFields: any = {
      Name: name,
      description,
      Brand_ID: brandId,
      Color_ID: colorId,
      Size_ID: sizeId,
      SKU_Code: skuCode,
      HSN_Code: hsnCode,
    };

    verifyRequiredFields(requiredFields);

    await throwIfNotExist<IBrand>(Brand, { _id: newObjectId(brandId), isDeleted: false }, ERROR.BRAND.NOT_FOUND);

    // const parentCatIdArr = category?.parentCategoryArr?.map((cat) => ({ categoryId: cat.categoryId }));

    if (!req.body?.barCode) {
      let countTotalBarCode = await BarCode.countDocuments();
      req.body.barCode = generateBarCodeWithValue(countTotalBarCode + 1);
    }
    const newProductObj: any = {
      ...req.body,
      // categoryIdArr: parentCatIdArr,
    };

    await throwIfExist<IProduct>(
      Product,
      {
        name: newRegExp(name),
        isDeleted: false,
      },
      ERROR.PRODUCT.EXIST,
    );
    await throwIfExist<IProduct>(
      Product,
      { skuCode: newRegExp(skuCode), isDeleted: false },
      ERROR.PRODUCT.EXIST_SKU_CODE,
    );

    if (imagesArr && imagesArr.length > 0) {
      for (const [i, obj] of imagesArr.entries()) {
        if (obj.image && typeof obj.image === "string") {
          obj.image = await storeFileAndReturnNameBase64(obj.image);
          obj.order = i;
        }
      }

      newProductObj["imagesArr"] = imagesArr;
    }

    if (thumbnail && typeof thumbnail === "string") {
      newProductObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newProduct = await createDocuments(Product, newProductObj);

    let newBarCodeObj = {
      barCode: newProduct.barCode,
      productId: newProduct._id,
      name: newProduct.name,
      barCodeType: BARCODE_TYPE.PACKET,
    };
    const data: any = await createDocuments(BarCode, newBarCodeObj);

    res.status(200).json({ message: MESSAGE.PRODUCT.CREATED, data: newProduct });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "QUERY IN GET PRODUCTS");
    console.log(req.query, "QUERY.......");

    let matchObj: Record<string, any> = { isDeleted: false };
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

    if (req.query.skuCode) {
      matchObj.skuCode = req.query.skuCode;
    }

    if (typeof req.query.categoryId === "string") {
      const categoriesLvl2 = await Category.find({ "parentCategoryArr.categoryId": newObjectId(req.query.categoryId) })
        .lean()
        .exec();

      const tempArr = [...categoriesLvl2?.map((cat: any) => cat?._id), newObjectId(req.query.categoryId)];
      matchObj["categoryId"] = {
        $in: tempArr,
      };
    }

    if (typeof req.query.isFocused === "string" && req.query.isFocused === "true") {
      matchObj.isFocused = true;
    }

    if (typeof req.query.areaId === "string") {
      const beat = await Area.findById(newObjectId(req.query.areaId)).exec();
      if (beat) {
        matchObj["$or"] = [
          { allowEveryWhere: true },
          { "countryArr.countryId": newObjectId(beat?.countryId) },
          { "stateArr.stateId": newObjectId(beat?.stateId) },
          { "cityArr.townId": newObjectId(beat?.cityId) },
          { "areaArr.areaId": newObjectId(beat?._id) },
        ];
      }
    }

    if (typeof req.query.search === "string") {
      matchObj["name"] = { $regex: new RegExp(req.query.search, "i") };
    }

    if (req.query.size && req.query.size != "" && typeof req.query.size == "string") {
        if (req.query.size?.includes(",")) {
          matchObj.sizeId = { $in: req.query.size.split(",").map((el) => newObjectId(el)) };
        } else {
          matchObj.sizeId = newObjectId(req.query.size);
        }
      }

      if (req.query.color && req.query.color != "" && typeof req.query.color == "string") {
         if (req.query.color?.includes(",")) {
           matchObj.colorId = { $in: req.query.color.split(",").map((el) => newObjectId(el)) };
         } else {
           matchObj.colorId = newObjectId(req.query.color);
         }
      }

      if (req.query.brand && req.query.brand != "" && typeof req.query.brand == "string") {
      if (req.query.brand?.includes(",")) {
        matchObj.brandId = { $in: req.query.brand.split(",").map((el) => newObjectId(el)) };
      } else {
        matchObj.brandId = newObjectId(req.query.brand);
      }
      }

    pipeline = [
      {
        $match: matchObj,
      },

      {
        $group: {
          _id: "$_id",

          name: {
            $first: "$name",
          },
          brandId: {
            $first: "$brandId",
          },
          skuCode: {
            $first: "$skuCode",
          },
          packet: {
            $first: "$packet",
          },
          gst: {
            $first: "$gst",
          },

          msp: {
            $first: "$msp",
          },
          box: {
            $first: "$box",
          },
          thumbnail: {
            $first: "$thumbnail",
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

    pipeline.push({ $sort: sortObj });

    const paginatedProducts: any = await paginateAggregate(Product, pipeline, req.query);

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

export const getProductWithAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };
    let pipeline: PipelineStage[] = [];

    pipeline = [
      {
        $match: matchObj,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $unwind: {
          path: "$attributeArr",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          attibuteName: "$attributeArr.name",
          price: "$attributeArr.price",
          msp: "$attributeArr.msp",
          totalItemInCarton: "$attributeArr.totalItemInCarton",
          attibuteBarCode: "$attributeArr.barCode",
          noOfItemInBox: "$attributeArr.noOfItemInBox",
          noOfItemInCarton: "$attributeArr.noOfItemInCarton",
        },
      },
      {
        $project: {
          productId: "$_id",
          name: {
            $concat: ["$name", " - ", "$attibuteName"],
          },
          attributeArr: "$attributeArr",
          price: "$price",
          msp: "$msp",
          gst: "$gst",
          totalItemInCarton: "$totalItemInCarton",
          skuCode: "$skuCode",
          hsnCode: "$hsnCode",
          barCode: "$attibuteBarCode",
          noOfItemInBox: "$noOfItemInBox",
          noOfItemInCarton: "$noOfItemInCarton",
        },
      },
    ];

    /**
     * lookup stock doc
     *
     * if userId and he has stock. attach stockObj with product
     *
     * else product without stockObj
     *
     */

    const productsArr = await paginateAggregate(Product, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: productsArr.data, total: productsArr.total });
  } catch (error) {
    next(error);
  }
};

export const getProductForUsersInStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };
    let pipeline: PipelineStage[] = [];

    if (typeof req.query.userId !== "string") {
      throw new Error(ERROR.USER.INVALID_USER_ID);
    }

    if (typeof req.query.search === "string") {
      matchObj["name"] = { $regex: new RegExp(req.query.search, "i") };
    }

    if (typeof req.query.brand === "string") {
      matchObj["brandId"] = newObjectId(req.query.brand);
    }

    pipeline = [
      {
        $match: matchObj,
      },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $unwind: {
          path: "$company",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $unwind: {
          path: "$brand",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "stocks",
          localField: "skuCode",
          foreignField: "skuCode",
          as: "stockObj",
        },
      },
      {
        $unwind: {
          path: "$stockObj",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "stockObj.userId": newObjectId(req.query.userId),
        },
      },
    ];

    const productsArr = await paginateAggregate(Product, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: productsArr.data, total: productsArr.total });
  } catch (error) {
    next(error);
  }
};

export const getProductForUsersNotInStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };
    let pipeline: PipelineStage[] = [];

    if (typeof req.query.userId !== "string") {
      throw new Error(ERROR.USER.INVALID_USER_ID);
    }

    if (typeof req.query.search === "string") {
      matchObj["name"] = { $regex: new RegExp(req.query.search, "i") };
    }

    if (typeof req.query.brand === "string") {
      matchObj["brandId"] = newObjectId(req.query.brand);
    }

    pipeline = [
      {
        $match: matchObj,
      },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $unwind: {
          path: "$company",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $unwind: {
          path: "$brand",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "stocks",
          localField: "skuCode",
          foreignField: "skuCode",
          as: "stockObj",
        },
      },
      {
        $unwind: {
          path: "$stockObj",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            {
              "stockObj.userId": {
                $ne: newObjectId(req.query.userId),
              },
            },
            { stockObj: { $exists: false } },
          ],
        },
      },
    ];

    const productsArr = await paginateAggregate(Product, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.PRODUCT.ALLPRODUCTS, data: productsArr.data, total: productsArr.total });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.params.id) throw new Error("Can't find product.");

    const product = await Product.aggregate([
      {
        $match: { _id: newObjectId(req.params.id), isDeleted: false },
      },
      {
        $lookup: {
          from: "colors",
          localField: "colorId",
          foreignField: "_id",
          as: "color",
        },
      },
      {
        $unwind: { path: "$color", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "sizes",
          localField: "sizeId",
          foreignField: "_id",
          as: "size",
        },
      },
      {
        $unwind: { path: "$size", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $unwind: { path: "$brand", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryIdArr.categoryId",
          foreignField: "_id",
          as: "parentCategoryArr",
        },
      },
    ]);

    res.status(200).json({ message: MESSAGE.PRODUCT.GOTBYID, data: product?.length ? product[0] : null });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const getProductBySkuCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await throwIfNotExist(
      Product,
      { skuCode: req.params.skuCode, isDeleted: false },
      ERROR.PRODUCT.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.PRODUCT.GOTBYSKU_CODE, data: product });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.params.id, "ID");

    if (!req.params.id) throw new Error("Can't find product.");

    const {
      name,
      companyId,
      brandId,
      details,
      categoryId,
      categoryIdArr,
      skuCode,
      weight,
      numberOfUnits,
      gst,
      mrp,
      pts,
      ptd,
      ptc,
      ptr,
      thumbnail,
      allowEveryWhere,
      freePieces,
      freePiecesPerProducts,
      imagesArr,
      countryArr,
      regionArr,
      stateArr,
      townArr,
      beatArr,
    } = req.body;

    const updatedObj: any = {};

    const product = await Product.findById(req.params.id).lean().exec();

    const nameTaken = await Product.findOne({
      name: newRegExp(name),
      isDeleted: false,
      companyId: newObjectId(companyId),
      brandId: newObjectId(brandId),
      categoryId: newObjectId(categoryId),
      _id: { $ne: newObjectId(req.params.id) },
    });

    if (nameTaken) throw new Error(ERROR.PRODUCT.EXIST);

    const skuTaken = await Product.findOne({
      skuCode: newRegExp(skuCode),
      isDeleted: false,
      _id: { $ne: newObjectId(req.params.id) },
    });

    if (skuTaken) throw new Error(ERROR.PRODUCT.EXIST_SKU_CODE);

    updatedObj.name = name;
    updatedObj.skuCode = skuCode;

    // if (categoryId !== product?.categoryId?.toString()) {
    //   const category = await Category.findById(categoryId).lean().exec();

    //   if (!category) throw new Error("Can't find category.");

    //   const parentCatIdArr = category?.parentCategoryArr?.map((cat) => ({ categoryId: cat.categoryId }));

    //   updatedObj.categoryIdArr = parentCatIdArr;
    //   updatedObj.categoryId = category?._id;
    // }

    if (imagesArr && imagesArr.length > 0) {
      let existingImagesArr: any = product?.imagesArr;

      for (let obj of imagesArr) {
        if (obj?.type === "old") {
          if (obj?.isDeleted === true) {
            existingImagesArr.splice(obj?.order, 1);
          }
        } else {
          obj.image = await storeFileAndReturnNameBase64(obj.image);
          existingImagesArr.push(obj);
        }
      }

      updatedObj["imagesArr"] = existingImagesArr?.map((obj: any, ind: number) => ({ image: obj?.image, order: ind }));
    }

    if (thumbnail && typeof thumbnail?.thumbnail === "string" && thumbnail?.isChanged === true) {
      updatedObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail?.thumbnail);
    }

    await Product.findByIdAndUpdate(req.params.id, updatedObj).exec();

    res.status(200).json({ message: MESSAGE.PRODUCT.UPDATED });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const updateProductIsFocused = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.body.productId,
      { $set: { isFocused: req.body.isFocused } },
      { new: true },
    )
      .lean()
      .exec();

    if (!updatedProduct) throw new Error(ERROR.PRODUCT.NOT_FOUND);

    res.status(200).json({ message: MESSAGE.PRODUCT.UPDATED, data: updatedProduct });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("PRODUCT CONTROLLER");

    const removed = await Product.findByIdAndDelete(req.params.id).exec();

    res.status(200).json({ message: MESSAGE.PRODUCT.REMOVED });
  } catch (error) {
    console.log("ERROR IN PRODUCT CONTROLLER");
    next(error);
  }
};
