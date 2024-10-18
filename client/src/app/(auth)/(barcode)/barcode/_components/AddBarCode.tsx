"use client";
import ErrorMessage from "@/components/ErrorMessage";
import { useNavigate } from "@/hooks/useNavigate";
import { IBarCodes, useAddBarCode, useBarCodeById, useUpdateBarCode } from "@/services/barcode.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Z } from "@/hooks/useZod";
import { useProduct } from "@/services/product.service";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import Select from "react-select";
import { BARCODE_TYPE } from "@/common/constant.common";

type Inputs = {
  barCodeType: string;
  productId: {
    label: string;
    value: string;
  };
};

type PartialIBarCodes = Partial<IBarCodes>;

const cartoonSchema = Z.object({
  barCodeType: Z.string().min(1, "Type is required."),
  productId: Z.object({
    label: Z.string().min(1, "Product is required (from label)"),
    value: Z.string().min(1, "Product is required."),
  }),
});

let defaultBarCodeValues = {
  barCodeType: "",
  productId: {
    label: "",
    value: "",
  },
};
export default function AddBarCode({ id }: { id: any }) {
  //IMPORTS
  const navigate = useNavigate();
  const { data: products } = useProduct({ pageSize: 1000, pageIndex: 0 }, true);
  const processedProducts = useProcessData(products);
  //DATA
  const { data: barcode } = useBarCodeById(id, !!id);

  //MUTANTS
  const { mutateAsync: addBarCode } = useAddBarCode();
  const { mutateAsync: updateBarCode } = useUpdateBarCode();

  //HOOK FORMS
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
  } = useForm<Inputs>({
    resolver: zodResolver(cartoonSchema),
    defaultValues: defaultBarCodeValues,
  });

  // useEffect(() => {
  //   if (id && barcode) {
  //     setValue("amount", barcode?.amount);
  //     setValue("description", barcode?.description);
  //   }
  // }, [id, barcode]);

  //HANDLERS
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      // process data? extra validations etc
      // if (id) {
      //   const res = await updateBarCode({ barcodeId: id, ...data });
      //   if (res.data?.message) {
      //     toastSuccess(res?.data?.message);
      //   }
      // } else {

      let obj: PartialIBarCodes = {
        ...data,
        productId: data?.productId?.value,
        name: data?.productId?.label,
      };
      const res = await addBarCode(obj);
      if (res.data?.message) {
        toastSuccess(res?.data?.message);
      }
      // }

      reset();
      navigate("/barcode");
    } catch (error) {
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
    <div className="row ">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <h5 className="text-maincolor mb-4">{id ? "Update" : "Add"} BarCode</h5>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3 position-relative">
              <label
                htmlFor="name"
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
                Type
              </label>
              <Controller
                name="productId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    instanceId={"productId"}
                    options={processedProducts.rows.map((el) => ({ label: el.name, value: el._id }))}
                    isSearchable={true}
                    isLoading={processedProducts.rows.length === 0}
                    styles={styling}
                  />
                )}
              />
              <ErrorMessage field={errors.productId?.label} />
            </div>

            <div className="mb-3 position-relative">
              <label
                htmlFor="weight"
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
                Type
              </label>

              <select className="form-control" {...register("barCodeType")}>
                {Object.values(BARCODE_TYPE).map(
                  (el: string) => el != BARCODE_TYPE.PACKET && <option key={el}>{el}</option>,
                )}
              </select>
              <ErrorMessage field={errors.barCodeType} />
            </div>

            <button type="submit" className="btn btn-maincolor mt-3">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
