import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useCategory } from "@/services/category.service";
import React, { useState, useEffect } from "react";
import Select from "react-select";

export interface CategoryType {
  _id: string;
  name: string;
  parentCategoryArr?: string[];
}

interface SelectOption {
  label: string;
  value: string;
}

interface SelectNestedCategoryProps {
  categoryArr: CategoryType[];
  onChange: (value: string[]) => void;
}

const SelectNestedCategory: React.FC<SelectNestedCategoryProps> = ({ onChange, categoryArr }) => {
  const [innerCategoryId, setInnerCategoryId] = useState<string>("");
  const [innerParentCategoryIdArr, setInnerParentCategoryIdArr] = useState<string[]>([]);
  const [localCategoryArr, setLocalCategoryArr] = useState<CategoryType[]>(categoryArr);
  const [selectOptions, setSelectOptions] = useState<SelectOption[][]>([]);
  const [parentCategory, setParentCategory] = useState<SelectOption>({
    label: "Please Select Category",
    value: "",
  });

  const [parentCategoryId, setParentCategoryId] = useState("0");
  const { data: category } = useCategory({}, false);
  const processedCategoryData = useProcessData(category);

  useEffect(() => {
    if (processedCategoryData.rows && processedCategoryData.rows.length > 0) {
      setDataOnInit();
    }
  }, [processedCategoryData.rows]);

  useEffect(() => {
    onChange(innerParentCategoryIdArr);
  }, [innerParentCategoryIdArr, onChange]);

  const setDataOnInit = async () => {
    try {
      if (innerParentCategoryIdArr && innerParentCategoryIdArr.length === 0) {
        setSelectOptions([
          processedCategoryData.rows
            .filter((el) => !el.parentCategoryArr?.length)
            .map((category) => ({ label: category.name, value: category._id })),
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onChangeSelect = async (index: number, value: any) => {
    try {
      setInnerParentCategoryIdArr((prev) => [...prev, value]);
      setSelectOptions((prev) => [
        ...prev,
        processedCategoryData.rows
          .filter((elx) => elx.parentCategory?._id == value)
          .map((category) => ({ label: category.name, value: category._id })),
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h6>Select Category:</h6>
      {selectOptions.map((el, i) => (
        <div key={i}>
          <Select
            value={el.find((elx) => innerParentCategoryIdArr.includes(elx.value))}
            options={el}
            onChange={(val) => val && onChangeSelect(i, val.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default SelectNestedCategory;
