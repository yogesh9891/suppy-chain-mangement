"use client";
import ErrorMessage from "@/components/ErrorMessage";
import { useNavigate } from "@/hooks/useNavigate";
import { IExpenses, useAddExpense, useExpenseById, useUpdateExpense } from "@/services/expense.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Z } from "@/hooks/useZod";
import { IExpenseCategory, useExpenseCategory } from "@/services/expenseCategory.service";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import Select from 'react-select';

type Inputs = {
  description: string;
  amount: number;
  expenseCategoryId: {
    label: string;
    value: string;
  };
};

type PartialIExpenseCodes = Partial<IExpenses>;

const cartoonSchema = Z.object({
  description: Z.string().min(1, "Name is required."),
  amount: Z.coerce.number().int().gte(1, { message: "Weight is required" }),
  expenseCategoryId: Z.object({
    label: Z.string().min(1, "Product is required (from label)"),
    value: Z.string().min(1, "Product is required."),
  }),
});

let defaultExpenseValues = {
  amount: 0,
  description: "",
  expenseCategoryId: {
    label: "",
    value: "",
  },
};
export default function AddExpense({ id }: { id: any }) {
  //IMPORTS
  const { data: expenseCategory } = useExpenseCategory({ pageSize: 1000, pageIndex: 1 }, true);
  const processedexpenseCategory = useProcessData(expenseCategory);
  const navigate = useNavigate();

  //DATA
  const { data: expense } = useExpenseById(id, !!id);

  //MUTANTS
  const { mutateAsync: addExpense } = useAddExpense();
  const { mutateAsync: updateExpense } = useUpdateExpense();

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
    defaultValues: defaultExpenseValues,
  });

  useEffect(() => {
    if (id && expense) {
      setValue("amount", expense?.amount);
      setValue("description", expense?.description);
    }
  }, [id, expense, setValue]);

  //HANDLERS
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      // process data? extra validations etc

       let obj: PartialIExpenseCodes = {
         ...data,
         expenseCategoryId: data?.expenseCategoryId?.value,
         expenseCategoryName: data?.expenseCategoryId?.label,
       };
      if (id) {
        const res = await updateExpense({ expenseId: id, ...obj });
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
        }
      } else {
        const res = await addExpense(obj);
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
        }
      }

      reset();
      navigate("/expense");
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

  console.log(errors)
  return (
    <div className="row ">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <h5 className="text-maincolor mb-4">{id ? "Update" : "Add"} Expense</h5>
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
                name="expenseCategoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    instanceId={"productId"}
                    options={processedexpenseCategory.rows.map((el) => ({ label: el.name, value: el._id }))}
                    isSearchable={true}
                    isLoading={processedexpenseCategory.rows.length === 0}
                    styles={styling}
                  />
                )}
              />
              <ErrorMessage field={errors.expenseCategoryId?.label} />
              <ErrorMessage field={errors.expenseCategoryId?.value} />
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
