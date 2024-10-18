"use client";
import ErrorMessage from "@/components/ErrorMessage";
import { useNavigate } from "@/hooks/useNavigate";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useCarton } from "@/services/carton.service";
import { useAddBox, useBoxById, useUpdateBox } from "@/services/box.service";
import { toastError, toastSuccess } from "@/utils/toast";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Select from "react-select";
import { Z } from "@/hooks/useZod";
import { zodResolver } from "@hookform/resolvers/zod";

type Inputs = {
  name: string;
  weight: number;
  noOfItems: number;
  itemWeight: number;
  barCode: string;
  cartonId: string;
};
const caonrtoSchema = Z.object({
  name: Z.string().min(1, "Name is required."),
  weight: Z.coerce.number().int().gte(1, { message: "Weight is required" }),
  itemWeight: Z.coerce.number().int().gte(1, { message: "Per Box Weight is required" }),
});

let defaultCartonValues = {
  weight: 0,
  noOfItems: 0,
  name: "",
};
export default function AddBox({ id }: { id: any }) {
  //IMPORTS
  const navigate = useNavigate();

  //STATE
  const [cartonId, setCartonId] = useState("");
  const [cartonName, setCartonName] = useState("");
  const [isMounted, setIsMounted] = useState(false); //To solve warnings. [Select]
  const [name, setName] = useState("");

  //DATA
  const { data: box } = useBoxById(id, !!id);
  const { data: carton } = useCarton({}, false);
  const processedCartonData = useProcessData(carton);

  //MUTANT
  const { mutateAsync: addBox } = useAddBox();
  const { mutateAsync: updateBox } = useUpdateBox();

  //USEEFFECT
  useEffect(() => setIsMounted(true), []);

  //HOOK FORM
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(caonrtoSchema),
    defaultValues: defaultCartonValues,
  });
  useEffect(() => {
    if (id && box) {
      setCartonName(box?.cartonName);
      setCartonId(box?.cartonId);
      setValue("name", box?.name);
      setValue("noOfItems", box?.noOfItems);
      setValue("weight", box?.weight);
      setValue("barCode", box?.barCode);
    }
  }, [id, box, setValue]);
  //SUBMIT HANDLER
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      if (!cartonId) {
        throw new Error("Select a carton");
      }

      let noOfItemsRemainder = data.weight % data.itemWeight;

      if (noOfItemsRemainder !== 0) {
        toastError("Please Enter Valid Total Weight Or Weight Per Box");
        return;
      }
      let noOfItems = data.weight / data.itemWeight;
      // process data? extra validations etc
      let obj = {
        ...data,
        noOfItems,
        cartonId,
        cartonName,
      };

      if (id) {
        const res = await updateBox({ ...obj, boxId: id });
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
          setCartonId("");
          setCartonName("");
        }
      } else {
        const res = await addBox(obj);
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
        }
      }
      reset();
      navigate("/box");
    } catch (error) {
      toastError(error);
    }
  };

  //STYLE SELECT
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
          <h5 className="text-maincolor mb-4">Add Box</h5>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4 position-relative">
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
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                aria-describedby="box name"
                {...register("name", {
                  required: "Name is required",
                })}
                style={{ position: "relative" }}
              />
            </div>
            <ErrorMessage field={errors.name} />

            <div className="mb-4 position-relative">
              <label
                htmlFor="carton"
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
                Carton
              </label>
              {isMounted && (
                <Select
                  options={processedCartonData.rows.map((el) => ({ label: el.name, value: el._id }))}
                  value={{
                    label: cartonName,
                    value: cartonId,
                  }}
                  styles={styling}
                  isClearable={false}
                  onChange={(val) => {
                    if (val) {
                      setCartonId(val?.value);
                      setCartonName(val?.label);
                    } else {
                      setCartonId("");
                      setCartonName("");
                    }
                  }}
                />
              )}
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
                Weight (in Gms)
              </label>
              <input
                type="text"
                className="form-control"
                id="weight"
                aria-describedby="carton weight"
                {...register("weight")}
                style={{ position: "relative" }}
              />
              <ErrorMessage field={errors.weight} />
            </div>

            <div className="mb-3 position-relative">
              <label
                htmlFor="itemWeight"
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
                No of Items
              </label>
              <input
                type="text"
                className="form-control"
                id="itemWeight"
                aria-describedby="carton itemWeight"
                {...register("itemWeight")}
                style={{ position: "relative" }}
              />
              <ErrorMessage field={errors.itemWeight} />
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
