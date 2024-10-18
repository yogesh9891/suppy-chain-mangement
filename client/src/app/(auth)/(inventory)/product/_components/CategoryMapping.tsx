import React, { useState, useEffect } from "react";

export interface CategoryType {
  _id: string;
  name: string;
  categoryId?: string;
  level: number;
  parentCategoryId?: string;
  order?: number;
  imagesArr: { image: string }[];
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
  label?: string;
  value?: string;
  subCategoryArr?: CategoryType[];
  checked?: boolean;
}

interface Props {
  categoriesArr: CategoryType[];
  upliftCategory: (categoriesArr: CategoryType[]) => void;
}

const CategoryMapping: React.FC<Props> = ({ categoriesArr, upliftCategory }) => {
  const [CategoryLocalArr, setCategoryLocalArr] = useState<CategoryType[]>(categoriesArr);

  useEffect(() => {
    setCategoryLocalArr(categoriesArr);
  }, [categoriesArr]);

  const handleRenderCheckboxCategory = (obj: CategoryType) => {
    return (
      <div className="col-12 mb-3" style={{ marginLeft: `${obj.level + 5}px` }}>
        <input
          className="form-check-input pointer"
          checked={obj.checked}
          onChange={(event) => handleNestedCategoryCheckBoxEvent(obj?._id, event.target.checked)}
          type="checkbox"
        />
        <label style={{ paddingLeft: 5 }}>{obj.name}</label>
        {obj.checked &&
          obj.subCategoryArr &&
          obj.subCategoryArr.length > 0 &&
          obj.subCategoryArr.map((el) => {
            return handleRenderCheckboxCategory(el);
          })}
      </div>
    );
  };
  const handleNestedCategoryCheckBoxEvent = (id: string, value: boolean) => {
    let tempCategoryArr = CategoryLocalArr.map((el) => {
      if (el._id == id) {
        el.checked = value;
        return el;
      } else {
        if (el.subCategoryArr && el.subCategoryArr.length > 0) {
          handleRenderNestedCategory(el.subCategoryArr, id, value);
          return el;
        } else {
          return el;
        }
      }
    });

    console.log(tempCategoryArr);
    setCategoryLocalArr([...tempCategoryArr]);
  };

  const handleRenderNestedCategory = (arr: CategoryType[], id: string, value: boolean) => {
    let tempArr = arr.map((el) => {
      if (el._id == id) {
        el.checked = value;
        return el;
      } else {
        if (el.subCategoryArr && el.subCategoryArr.length > 0) {
          handleRenderNestedCategory(el.subCategoryArr, id, value);
        } else {
          return el;
        }
      }
    });
    return tempArr;
  };

  return (
    <>
      {CategoryLocalArr &&
        CategoryLocalArr.length > 0 &&
        CategoryLocalArr.map((elx, indexXX) => {
          return handleRenderCheckboxCategory(elx);
        })}
    </>
  );
};

export default CategoryMapping;
