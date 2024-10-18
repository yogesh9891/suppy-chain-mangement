"use client";
import ErrorMessage from "@/components/ErrorMessage";
import { useNavigate } from "@/hooks/useNavigate";
import { IPayments, useAddPayment, usePaymentById, useUpdatePayment } from "@/services/payment.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Z } from "@/hooks/useZod";
import { useProduct } from "@/services/product.service";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import Select from "react-select";
import { BARCODE_TYPE, ROLES } from "@/common/constant.common";
import { useUser } from "@/services/user.service";

type Inputs = {
  description: string;
  amount: number;
  userId: {
    label: string;
    value: string;
  };
  storeId: {
    label: string;
    value: string;
  };
};

type PartialIPayments = Partial<IPayments>;

const cartoonSchema = Z.object({
  description: Z.string().min(1, "Description is required."),
  amount: Z.coerce.number().int().gte(1, { message: "Amount is required" }),
  userId: Z.object({
    label: Z.string().min(1, "User is required (from label)"),
    value: Z.string().min(1, "User is required."),
  }),
  storeId: Z.object({
    label: Z.string().min(1, "Store is required (from label)"),
    value: Z.string().min(1, "Store is required."),
  }),
});

let defaultPaymentValues = {
  amount: 0,
  description: "",
  storeId: {
    label: "",
    value: "",
  },
  userId: {
    label: "",
    value: "",
  },
};
export default function AddPayment({ id }: { id: any }) {
  //IMPORTS
  const navigate = useNavigate();
  const { data: users } = useUser({ role: ROLES.USER, isVendor :true});
  const processedUsers = useProcessData(users);

  const { data: stores } = useUser({ role: ROLES.STORE, isVendor: true });
    const processedStores = useProcessData(stores);
  //DATA
  const { data: payment } = usePaymentById(id, !!id);

  //MUTANTS
  const { mutateAsync: addPayment } = useAddPayment();
  const { mutateAsync: updatePayment } = useUpdatePayment();

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
    defaultValues: defaultPaymentValues,
  });

  // useEffect(() => {
  //   if (id && payment) {
  //     setValue("amount", payment?.amount);
  //     setValue("description", payment?.description);
  //   }
  // }, [id, payment]);

  //HANDLERS
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {

      let obj: PartialIPayments = {
        ...data,
        storeId: data?.storeId?.value,
        userId: data?.userId?.value,
      };
      const res = await addPayment(obj);
      if (res.data?.message) {
        toastSuccess(res?.data?.message);
      }
      // }

      reset();
      navigate("/payment");
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
          <h5 className="text-maincolor mb-4">{id ? "Update" : "Add"} Payment</h5>
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
                Customer
              </label>
              <Controller
                name="userId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    instanceId={"userId"}
                    options={processedUsers.rows.map((el) => ({ label: el.name, value: el._id }))}
                    isSearchable={true}
                    isLoading={processedUsers.rows.length === 0}
                    styles={styling}
                  />
                )}
              />
              <ErrorMessage field={errors.userId?.label} />
            </div>

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
                Store
              </label>
              <Controller
                name="storeId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    instanceId={"storeId"}
                    options={processedStores.rows.map((el) => ({ label: el.name, value: el._id }))}
                    isSearchable={true}
                    isLoading={processedStores.rows.length === 0}
                    styles={styling}
                  />
                )}
              />
              <ErrorMessage field={errors.storeId?.label} />
            </div>

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
                Description
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                aria-describedby="expense name"
                {...register("description", {
                  required: "Description is required",
                })}
                style={{ position: "relative" }}
              />
              <ErrorMessage field={errors.description} />
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
                Amount
              </label>
              <input
                type="text"
                className="form-control"
                id="weight"
                aria-describedby="expense weight"
                {...register("amount")}
                style={{ position: "relative" }}
              />
              <ErrorMessage field={errors.amount} />
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
