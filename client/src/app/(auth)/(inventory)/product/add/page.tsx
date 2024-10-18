"use client";
import Link from "next/link";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/utils/toast";
import { useNavigate } from "@/hooks/useNavigate";
import Select from "react-select";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useZodResolver } from "@/hooks/useZod";
import ErrorMessage from "@/components/ErrorMessage";
import { useCompany } from "@/services/company.service";
import { useCategory, useNestedCategory } from "@/services/category.service";
import { useBrand } from "@/services/brand.service";
import { PartialProduct, useAddProduct } from "@/services/product.service";
import { useEffect, useRef, useState } from "react";
import { ProductInputs, defaultProductValues, productSchema } from "../_product.utils/validationSchema";
import { Form } from "react-bootstrap";
import SetHeaderName from "@/components/SetHeaderName";
import { HiOutlinePhotograph } from "react-icons/hi";
import Image from "next/image";
import CategoryMapping, { CategoryType } from "../_components/CategoryMapping";
import { useColor } from "@/services/color.service";
import { useSize } from "@/services/size.service";
import { getLatesBarCodeInSeries, useLatesBarCodeInSeries } from "@/services/barcode.service";

export default function Page() {
  //IMPORTS
  const zodResolver: any = useZodResolver();
  const navigate = useNavigate();
  //STATES
  const [imagesArr, setImagesArr] = useState<any[]>([]);
  const [imageBlobsArr, setImageBlobsArr] = useState<any[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const [catQueryObj, setCatQueryObj] = useState<any>(null);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [thumbnailBLob, setThumbnailBlob] = useState<any>();
  const [thumbnailError, setThumbnailError] = useState<string>("");

  //REF
  const imageErr = useRef<any>();
  const thumbnailErr = useRef<any>();

  //HOOK_FORM
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setError,
    setValue,
    reset,
  } = useForm<ProductInputs>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultProductValues,
  });

  //DATA

  const { data: brands } = useBrand({ pageSize: 1000, pageIndex: 0 }, false);
  const processedBrandData = useProcessData(brands);

  const { data: colors } = useColor({ pageSize: 1000, pageIndex: 0 }, false);
  const processedColorData = useProcessData(colors);

  const { data: sizes } = useSize({ pageSize: 1000, pageIndex: 0 }, false);
  const processedSizeData = useProcessData(sizes);

  const { mutateAsync } = useAddProduct();

  const { data: categories } = useNestedCategory();
  const [categoriesArr, setCategoriesArr] = useState<any>([]);
  useEffect(() => {
    getLatestBarCode();
    if (categories) {
      setCategoriesArr(categories);
    }
  }, [categories]);

  const getLatestBarCode = async () => {
    try {
      let { data: res } = await getLatesBarCodeInSeries();

      if (res.data) {
        setValue("barCode", res.data);
      }

      console.log(res, "resresresresresresresresresres");
    } catch (error) {
      console.log(error);
    }
  };

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
  const handleChooseImage = async (e: any) => {
    try {
      setImageError("");
      const files = e.target.files;

      let tempImageArr = [...imagesArr];

      console.log(tempImageArr, "tempImageArrtempImageArr");
      let blobs = [...imageBlobsArr];
      for (let i = 0; i < files.length; i++) {
        blobs.push(files[i]);
        const result = await setFileToBase(files[i]);
        if (typeof result === "string") {
          tempImageArr.push({ image: result, order: i });
        }
      }
      console.log(tempImageArr, "tempImageArrtempImageArr");

      setImageBlobsArr(blobs);
      setImagesArr(tempImageArr);
    } catch (error) {
      toastError(error);
    }
  };
  const handleDeleteImage = (ind: number) => {
    try {
      setImageBlobsArr((prev: any) => prev?.filter((img: any, i: number) => i !== ind));
      setImagesArr((prev: any) => prev?.filter((imgObj: any, i: number) => i !== ind));
    } catch (error) {
      toastError(error);
    }
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

  const processedCategories = new Set<CategoryType>();

  function returnSelectedCategories(arr: CategoryType[]): any[] {
    const new_selected_arr = arr.filter((el) => el.checked);
    const subCategories = arr.reduce((acc, el) => {
      if (!processedCategories.has(el)) {
        el.categoryId = el._id;
        processedCategories.add(el);
        if (el?.subCategoryArr) {
          acc.push(...el.subCategoryArr.filter((el) => el.checked));
        }
      }
      return acc;
    }, [] as CategoryType[]); // Explicitly typed as CategoryType[]
    if (subCategories.length) {
      return [...new_selected_arr, ...returnSelectedCategories(subCategories)];
    } else {
      return [...new_selected_arr];
    }
  }

  //SUBMIT HANDLER
  const onSubmit: SubmitHandler<ProductInputs> = async (data) => {
    try {
      let cat_arr = returnSelectedCategories(categoriesArr);

      // if (thumbnail?.length <= 0) {
      //   setThumbnailError("Choose thumbnail.");
      //   thumbnailErr.current.focus();
      //   return;
      // }

      // if (imagesArr?.length <= 0) {
      //   setImageError("Choose images.");
      //   imageErr.current.focus();
      //   return;
      // }

      let obj: PartialProduct = {
        ...data,
        brandId: data?.brandId?.value,
        colorId: data?.colorId?.value,
        sizeId: data?.sizeId?.value,
        imagesArr,
        thumbnail,
        categoryArr: cat_arr,
        name: `${data?.sizeId?.label} ${data?.colorId?.label} ${data?.brandId?.label} ${data?.packet}`,
      };

      console.log(obj, "objobjobj");
      const res = await mutateAsync(obj);

      if (res.data.data) {
        toastSuccess(res.data.message);
      }
      navigate("/product");
      reset();
    } catch (error: any) {
      toastError(error);
    }
  };

  //STYLE
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
      <form className="col" onSubmit={handleSubmit(onSubmit)}>
        <div className="global_shadow_border global_padding">
          <SetHeaderName name="Add Product" />
          <div className="row ">
            <div className="col">
              <div className="d-flex align-items-center">
                <div className="flex-fill">{/* <h4 className="mb-0">Add Product</h4> */}</div>
                <div>
                  <Link href={`/product`} className="btn btn-maincolor">
                    View Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-md-4">
              <div className="mb-4 position-relative">
                <label
                  htmlFor="brand"
                  className="form-label"
                  style={{
                    position: "absolute",
                    zIndex: "1",
                    background: "#fff",
                    top: "-13px",
                    left: "12px",
                    padding: "0px 5px",
                  }}
                >
                  Size
                </label>
                <Controller
                  name="sizeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      instanceId={"sizeId"}
                      options={processedSizeData.rows.map((el) => ({ label: el.name, value: el._id }))}
                      isSearchable={true}
                      isLoading={processedSizeData.rows.length === 0}
                      styles={styling}
                    />
                  )}
                />
                <ErrorMessage field={errors.sizeId?.value} />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-4 position-relative">
                <label
                  htmlFor="color"
                  className="form-label"
                  style={{
                    position: "absolute",
                    zIndex: "1",
                    background: "#fff",
                    top: "-13px",
                    left: "12px",
                    padding: "0px 5px",
                  }}
                >
                  Color
                </label>
                <Controller
                  name="colorId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      instanceId={"colorId"}
                      options={processedColorData.rows.map((el) => ({ label: el.name, value: el._id }))}
                      isSearchable={true}
                      isLoading={processedColorData.rows.length === 0}
                      styles={styling}
                    />
                  )}
                />
                <ErrorMessage field={errors.colorId?.value} />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-4 position-relative">
                <label
                  htmlFor="brand"
                  className="form-label"
                  style={{
                    position: "absolute",
                    zIndex: "1",
                    background: "#fff",
                    top: "-13px",
                    left: "12px",
                    padding: "0px 5px",
                  }}
                >
                  Brand
                </label>
                <Controller
                  name="brandId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      instanceId={"brandId"}
                      options={processedBrandData.rows.map((el) => ({ label: el.name, value: el._id }))}
                      isSearchable={true}
                      isLoading={processedBrandData.rows.length === 0}
                      styles={styling}
                    />
                  )}
                />
                <ErrorMessage field={errors.brandId?.value} />
              </div>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-4 position-relative" controlId="name">
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
                  Packet
                </Form.Label>
                <Form.Control
                  style={{ position: "relative" }}
                  placeholder="Enter No, Of Packet"
                  type="number"
                  {...register("packet")}
                />
                <ErrorMessage field={errors.packet} />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-4 position-relative" controlId="name">
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
                  Box
                </Form.Label>
                <Form.Control
                  style={{ position: "relative" }}
                  placeholder="Enter No. Of Box"
                  type="number"
                  {...register("box")}
                />
                <ErrorMessage field={errors.box} />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-4 position-relative" controlId="name">
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
                  Bar Code
                </Form.Label>
                <Form.Control
                  style={{ position: "relative" }}
                  placeholder="Enter Bar Code..."
                  type="text"
                  {...register("barCode")}
                />
                <ErrorMessage field={errors.barCode} />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-4 position-relative" controlId="name">
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
                  SKU Code
                </Form.Label>
                <Form.Control
                  style={{ position: "relative" }}
                  placeholder="Enter SKU Code..."
                  type="text"
                  {...register("skuCode")}
                />
                <ErrorMessage field={errors.skuCode} />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-4 position-relative" controlId="name">
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
                  HSN Code
                </Form.Label>
                <Form.Control
                  style={{ position: "relative" }}
                  placeholder="Enter SKU Code..."
                  type="text"
                  {...register("hsnCode")}
                />
                <ErrorMessage field={errors.hsnCode} />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-4 position-relative" controlId="name">
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
                  GST
                </Form.Label>
                <Form.Control
                  style={{ position: "relative" }}
                  placeholder="Enter GST..."
                  type="number"
                  {...register("gst")}
                />
                <ErrorMessage field={errors.gst} />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-4 position-relative" controlId="name">
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
                  MSP
                </Form.Label>
                <Form.Control
                  style={{ position: "relative" }}
                  placeholder="Enter MSP..."
                  type="number"
                  {...register("msp")}
                />
                <ErrorMessage field={errors.msp} />
              </Form.Group>
            </div>

            <div className="col-md-12 my-3">
              <h4>Product Information</h4>
            </div>
            <div className="col-md-4">
              <div className="mb-4 position-relative">
                <label
                  htmlFor="brand"
                  className="form-label"
                  style={{
                    zIndex: "1",
                    background: "#fff",
                    top: "-13px",
                    left: "12px",
                    padding: "0px 5px",
                  }}
                >
                  Category
                </label>
                <CategoryMapping
                  categoriesArr={[...categoriesArr]}
                  upliftCategory={(value) => setCategoriesArr(value)}
                />
              </div>
            </div>

            <div className="col-md-6 bg-body-seconday">
              <Form.Group controlId="thumbnail">
                <Form.Label>
                  Select thumbnail <HiOutlinePhotograph />
                  {thumbnailBLob && (
                    <div className="bg-body-secondary p-2 position-relative">
                      <Image
                        src={URL.createObjectURL(thumbnailBLob)}
                        alt=""
                        width={150}
                        height={150}
                        className="my-2"
                      />
                    </div>
                  )}
                </Form.Label>
                <Form.Control
                  type="file"
                  ref={thumbnailErr}
                  onChange={(e: any) => handleChooseThumbnail(e)}
                  style={{ padding: "0.375rem 0.75rem !important" }}
                />
                <ErrorMessage field={thumbnailError} />
              </Form.Group>
            </div>
          </div>
          {/* thumbnail */}
          <div className="row ">
            <div className="col-md-12">
              <Form.Group className="mb-4 position-relative" controlId="description">
                <Form.Label className="mt-4">Description</Form.Label>
                <Form.Control as="textarea" rows={3} {...register("description")} />

                <ErrorMessage field={errors.description} />
              </Form.Group>
            </div>
          </div>
          {/* ImagesArr */}
          {/* <div className="row">
            <div className="col bg-body-seconday">
              <Form.Group controlId="images">
                <Form.Label>
                  Select image <HiOutlinePhotograph />
                </Form.Label>
                <Form.Control
                  type="file"
                  ref={imageErr}
                  onChange={(e: any) => handleChooseImage(e)}
                  multiple
                  style={{ padding: "0.375rem 0.75rem !important" }}
                />
                <ErrorMessage field={imageError} />
              </Form.Group>
            </div>
          </div>
          <div className="row mt-2 mb-3">
            <div className="col d-flex flex-wrap">
              {imageBlobsArr?.length > 0 &&
                imageBlobsArr?.map((blob: any, ind: number) => (
                  <div className="bg-body-secondary p-2 position-relative" key={ind}>
                    <Image src={URL.createObjectURL(blob)} alt="" width={150} height={150} className="my-2" />
                    <div
                      className="position-absolute top-0 end-0 bg-body-tertiary rounded-5 px-2"
                      role="button"
                      onClick={() => handleDeleteImage(ind)}
                    >
                      x
                    </div>
                  </div>
                ))}
            </div>
          </div> */}

          <div className="row mt-3">
            <div className="col">
              <button type="submit" className="btn btn-maincolor">
                {!isSubmitting ? "Submit" : "Loading..."}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
