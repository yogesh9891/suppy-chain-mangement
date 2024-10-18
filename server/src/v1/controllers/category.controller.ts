import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Category, ICategory } from "models/category.model";
import { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import {
  createDocuments,
  find,
  findByIdAndUpdate,
  newObjectId,
  throwIfExist,
  throwIfNotExist,
} from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";
interface CategoryResponse {
  _id?: string;
  name: string;
  level: number;
  parentCategoryId?: string;
  order?: number;
  imagesArr: { image: string }[];
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
  label?: string;
  value?: string;
  subCategoryArr?: CategoryResponse[];
  checked?: boolean;
}
type PartialCategory = Partial<ICategory>;

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail, parentCategoryId }: ICategory = req.body;

    const requiredFields = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    const newCategoryObj: PartialCategory = {
      name,
    };

    let existCheckObj: any = { name: newRegExp(req.body.name), isDeleted: false };
    let parentCategory: any = null;

    if (parentCategoryId) {
      parentCategory = await throwIfNotExist<ICategory>(
        Category,
        {
          _id: newObjectId(parentCategoryId),
          isDeleted: false,
        },
        ERROR.CATEGORY.NOT_FOUND_PARENT,
      );

      existCheckObj["parentCategoryId"] = newObjectId(parentCategoryId);
    }

    await throwIfExist(Category, existCheckObj, ERROR.CATEGORY.EXIST);

    if (parentCategoryId) {
      newCategoryObj["parentCategoryId"] = parentCategoryId;
      newCategoryObj["parentCategoryArr"] = [...parentCategory.parentCategoryArr, { categoryId: parentCategory._id }];
      newCategoryObj.level = parentCategory.level + 1;
    }

    if (thumbnail && typeof thumbnail === "string") {
      const thubnailImage: any = await storeFileAndReturnNameBase64(thumbnail);
      newCategoryObj["thumbnail"] = thubnailImage;
    }

    const newCategory = await createDocuments(Category, newCategoryObj);

    res.status(200).json({ message: MESSAGE.CATEGORY.CREATED, data: newCategory });
  } catch (error) {
    console.log("ERROR IN CATEGORY CONTROLLER");
    next(error);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };
    let sortObj: Record<string, any> = { createdAt: -1 };

    if (typeof req.query.parentCategoryId === "string") {
      matchObj.parentCategoryId = newObjectId(req.query.parentCategoryId);
    }

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    if (req.query.level) {
      matchObj.level = Number(req.query.level);
    }

    let pipeline: PipelineStage[] = [
      {
        $match: matchObj,
      },
      {
        $lookup: {
          from: "categories",
          localField: "parentCategoryId",
          foreignField: "_id",
          as: "parentCategory",
        },
      },
      {
        $unwind: {
          path: "$parentCategory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: sortObj,
      },
    ];

    const catArr = await paginateAggregate(Category, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.CATEGORY.ALLCATEGORY, data: catArr.data, total: catArr.total });
  } catch (error) {
    console.log("ERROR IN CATEGORY CONTROLLER");
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await throwIfNotExist(Category, { _id: newObjectId(req.params.id) }, ERROR.CATEGORY.NOT_FOUND);
    res.status(200).json({ message: MESSAGE.CATEGORY.GOTBYID, data: category });
  } catch (error) {
    console.log("ERROR IN CATEGORY CONTROLLER");
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("CATEGORY CONTROLLER");

    let { name, thumbnail, parentCategoryId }: ICategory = req.body;

    const category: any = await throwIfNotExist(
      Category,
      { _id: newObjectId(req.params.id) },
      ERROR.CATEGORY.NOT_FOUND,
    );

    let existCheckObj: any = { _id: { $ne: newObjectId(req.params.id) }, isDeleted: false };
    let parentCategory: any = null;

    let categoryObjToUpdate: PartialCategory | any = {};

    if (name) {
      existCheckObj["name"] = newRegExp(name, "i");
      categoryObjToUpdate["name"] = name;
    }

    if (parentCategoryId) {
      parentCategory = await throwIfNotExist<ICategory>(
        Category,
        {
          _id: newObjectId(parentCategoryId),
          isDeleted: false,
        },
        ERROR.CATEGORY.NOT_FOUND_PARENT,
      );

      existCheckObj["parentCategoryId"] = newObjectId(parentCategoryId);
      categoryObjToUpdate["parentCategoryId"] = newObjectId(parentCategoryId);
    } else if (category?.parentCategoryId) {
      existCheckObj["parentCategoryId"] = newObjectId(category?.parentCategoryId);
    }

    await throwIfExist<ICategory>(Category, existCheckObj, ERROR.CATEGORY.EXIST);

    if (thumbnail && thumbnail.includes("base64")) {
      categoryObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    console.log(
      categoryObjToUpdate,
      "categoryObjToUpdatecategoryObjToUpdatecategoryObjToUpdatecategoryObjToUpdatecategoryObjToUpdate",
    );
    const updatedCategory = await findByIdAndUpdate(Category, newObjectId(req.params.id), categoryObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.CATEGORY.UPDATED, data: updatedCategory });
  } catch (error) {
    console.log("ERROR IN CATEGORY CONTROLLER");
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category: ICategory | any = await throwIfNotExist<ICategory>(
      Category,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.CATEGORY.NOT_FOUND,
    );

    await throwIfExist<ICategory>(
      Category,
      { parentCategoryId: category?._id, isDeleted: false },
      ERROR.CATEGORY.CANT_DELETE,
    );

    const dataToSoftDelete = {
      isDeleted: true,
      deletedOn: new Date(),
    };

    await findByIdAndUpdate<ICategory>(Category, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.CATEGORY.REMOVED });
  } catch (error) {
    console.log("ERROR IN CATEGORY CONTROLLER");
    next(error);
  }
};

export const getNestedCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mainCategoryArr: CategoryResponse[] | null = await find(Category, { isDeleted: false });

    console.log(mainCategoryArr);

    const setSubcategoryArr = (id: string): CategoryResponse[] => {
      if (!id) return [];
      const tempArr = mainCategoryArr ? mainCategoryArr.filter((el) => `${el.parentCategoryId}` == `${id}`) : [];
      if (tempArr.length === 0) return [];

      return tempArr.map((el) => ({
        ...el,
        label: el.name,
        value: el._id,
        subCategoryArr: setSubcategoryArr(`${el._id}`),
        checked: false,
      }));
    };

    const finalArr: CategoryResponse[] = (mainCategoryArr ? mainCategoryArr : [])
      .filter((el) => el.level === 1)
      .map((el) => ({
        ...el,
        label: el.name,
        value: el._id,
        subCategoryArr: setSubcategoryArr(`${el._id}`),
        checked: false,
      }));

    res.status(200).json({ message: "Category Arr", data: finalArr, success: true });
  } catch (err) {
    next(err);
  }
};
