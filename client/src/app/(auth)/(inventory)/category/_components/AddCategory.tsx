"use client";
import ErrorMessage from "@/components/ErrorMessage";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useAddCategory, useCategory, useCategoryById, useUpdateCategory } from "@/services/category.service";
import { toastError, toastSuccess } from "@/utils/toast";
import React, { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Select from "react-select";
import { categorySchema } from "../_category.utils/validationSchema";
import { useZodResolver } from "@/hooks/useZod";
import { Form } from "react-bootstrap";
import { HiOutlinePhotograph } from "react-icons/hi";
import Image from "next/image";
import { useNavigate } from "@/hooks/useNavigate";
import { generateFilePath } from "@/services/url.service";
import SelectNestedCategory, { CategoryType } from "./SelectNestedCategory";

type Inputs = {
  name: string;
  // parentCategoryId?: {
  //   label: string;
  //   value: string;
  // };
};

type PartialInputs = Partial<Inputs>;

export default function AddCategory({ id }: { id: any }) {
  //IMPORTS

  const navigate = useNavigate();
  //STATES
  const [showParentCategory, setShowParentCategroy] = useState<boolean>(false);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [thumbnailBLob, setThumbnailBlob] = useState<any>();
  const [thumbnailError, setThumbnailError] = useState<string>("");
  const [name, setName] = useState<string>("");
  //DATA
  const { data: category } = useCategoryById(id, !!id);

  const [categoryArr, setCategoryArr] = useState<CategoryType[]>([]);

  const zodResolver: any = useZodResolver();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PartialInputs>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: name,
      // parentCategoryId: {
      //   label: "",
      //   value: "",
      // },
    },
    values: {
      name: name,
      // parentCategoryId: {
      //   label: "",
      //   value: "",
      // },
    },
  });

  //REF
  const thumbnailErr = useRef<any>();

  //DATA
  // const { data: parentCategories } = useCategory({}, false);
  // const processedData = useProcessData(parentCategories);

  //MUTANTS
  const { mutateAsync } = useAddCategory();
  const { mutateAsync: updateCategory } = useUpdateCategory();

  //HANDLERS
  const setFileToBase = (file: any) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const result = reader?.result;
        resolve(result);
      };
    });
  };
  const handleChooseThumbnail = async (e: any) => {
    try {
      setThumbnailError("");
      const file = e.target.files[0];
      setThumbnailBlob(file);
      const result = await setFileToBase(file);
      if (typeof result === "string") {
        setThumbnail(result);
      }
    } catch (error) {
      toastError(error);
    }
  };

  useEffect(() => {
    if (id && category) {
      setName(category?.name);
      setThumbnail(category?.thumbnail);
    }
  }, [id, category]);

  //SUBMIT HANDLER
  const onSubmit: SubmitHandler<PartialInputs> = async (data) => {
    try {
      // if (thumbnail?.length <= 0) {
      //   setThumbnailError("Choose thumbnail.");
      //   thumbnailErr.current.focus();
      //   return;
      // }

      console.log(data, "sdfdsfsdfsdsfsdsdf");

      const newCategoryObj: any = {
        ...data,
        thumbnail,
      };

      if (categoryArr && categoryArr?.length > 0) {
        newCategoryObj.parentCategoryArr = categoryArr.map((el) => ({ categoryId: el }));
        newCategoryObj.parentCategoryId = categoryArr[categoryArr.length - 1];
      }
      if (id) {
        const res = await updateCategory({ categoryId: id, ...newCategoryObj });
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
          setThumbnailBlob("");
          setThumbnail("");
        }
      } else {
        const res = await mutateAsync(newCategoryObj);
        if (res.data.data) {
          toastSuccess(res.data.message);
          setThumbnailBlob("");
          setThumbnail("");
        }
      }

      reset();
      navigate("/category");
    } catch (error) {
      toastError(error);
    }
  };

  //STYLES
  const styling = {
    control: (base: any) => ({
      ...base,
      border: "1px solid #D9D9D9 !important",
      boxShadow: "0 !important",
      position: "relative",
      padding: "6px 10px !important",

      "&:hover": {
        border: "1px solid #D9D9D9 !important",
      },
    }),

    option: (base: any, { isFocused, isSelected }: any) => ({
      ...base,
      color: "#09021C !important",
      fontSize: "14px !important",
      fontWeight: "400 !important",
      background: isFocused
        ? "rgba(237, 237, 237, 1) !important"
        : isSelected
          ? "rgba(237, 237, 237, 1) !important"
          : "white",
      cursor: "pointer !important",
    }),

    menu: (base: any) => ({
      ...base,
      zIndex: "2 !important",
      position: "absolute !important",
    }),
  };

  return (
    <div className="row">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <h5 className="text-maincolor mb-4">Add Category</h5>
          <div className="row">
            <div className="col">
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3 position-relative" controlId="name">
                  <Form.Label
                    style={{
                      position: "absolute",
                      zIndex: "1",
                      background: "#fff",
                      top: "-13px",
                      left: "12px",
                      padding: "0px 5px",
                    }}
                  >
                    Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Category Name..."
                    {...register("name")}
                    style={{ position: "relative" }}
                  />
                  <ErrorMessage field={errors.name} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="thumbnail">
                  <Form.Label>
                    Select thumbnail <HiOutlinePhotograph />
                  </Form.Label>
                  <Form.Control
                    type="file"
                    ref={thumbnailErr}
                    onChange={(e: any) => handleChooseThumbnail(e)}
                    style={{ padding: "0.375rem 0.75rem !important" }}
                  />
                  <ErrorMessage field={thumbnailError} />
                </Form.Group>
                <div className="row mt-2 mb-3">
                  <div className="col d-flex flex-wrap">
                    {thumbnailBLob && (
                      <div className="bg-body-secondary p-2 position-relative">
                        <Image
                          src={URL.createObjectURL(thumbnailBLob)}
                          alt=""
                          width={100}
                          height={100}
                          className="my-2"
                        />
                      </div>
                    )}

                    {thumbnail && !`${thumbnail}`.includes("base64") && (
                      <div className="bg-body-secondary p-2 position-relative">
                        <Image src={generateFilePath(thumbnail)} alt="" width={100} height={100} className="my-2" />
                      </div>
                    )}
                  </div>
                </div>
                <Form.Group className="mb-3" controlId="parentCategory">
                  <Form.Check
                    type="checkbox"
                    onChange={(e) => setShowParentCategroy(e?.target?.checked)}
                    checked={showParentCategory}
                    label="Add as A Subcategory"
                  />
                </Form.Group>
                {showParentCategory && (
                  <Form.Group className="mb-3 mt-4 position-relative" controlId="parentCategoryId">
                    <Form.Label
                      style={{
                        position: "absolute",
                        zIndex: "1",
                        background: "#fff",
                        top: "-13px",
                        left: "12px",
                        padding: "0px 5px",
                      }}
                    >
                      Parent Category
                    </Form.Label>

                    <SelectNestedCategory categoryArr={categoryArr} onChange={(value: any) => setCategoryArr(value)} />
                    {/* <Controller
                      name="parentCategoryId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          instanceId={"parentCategoryId"}
                          {...field}
                          options={processedData.rows.map((el) => ({ label: el.name, value: el._id }))}
                          styles={styling}
                        />
                      )}
                    /> 
                    <ErrorMessage field={errors.parentCategoryId?.value} />
                    */}
                  </Form.Group>
                )}

                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-maincolor">
                    Submit
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
