"use client";
import ErrorMessage from "@/components/ErrorMessage";
import { useNavigate } from "@/hooks/useNavigate";
import { useAddCarton, useCartonById, useUpdateCarton } from "@/services/carton.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Z } from "@/hooks/useZod";

type Inputs = {
  name: string;
  weight: number;
  itemWeight: number;
  barCode: string;
  noOfItems: number;
};

const cartoonSchema = Z.object({
  name: Z.string().min(1, "Name is required."),
  weight: Z.coerce.number().int().gte(1, { message: "Weight is required" }),
  itemWeight: Z.coerce.number().int().gte(1, { message: "Per Box Weight is required" }),
});

let defaultCartonValues = {
  weight: 0,
  itemWeight: 0,
  name: "",
};
export default function AddCarton({ id }: { id: any }) {
  //IMPORTS
  const navigate = useNavigate();

  //DATA
  const { data: carton } = useCartonById(id, !!id);

  //MUTANTS
  const { mutateAsync: addCarton } = useAddCarton();
  const { mutateAsync: updateCarton } = useUpdateCarton();

  //HOOK FORMS
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(cartoonSchema),
    defaultValues: defaultCartonValues,
  });

  useEffect(() => {
    if (id && carton) {
      setValue("name", carton?.name);
      setValue("itemWeight", carton?.itemWeight);
      setValue("weight", carton?.weight);
      setValue("barCode", carton?.barCode);
    }
  }, [id, carton, setValue]);

  //HANDLERS
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      // process data? extra validations etc

      let noOfItemsRemainder = data.weight % data.itemWeight;

      if (noOfItemsRemainder !== 0) {
        toastError("Please Enter Valid Total Weight Or Weight Per Box");
        return;
      }
      let noOfItems = data.weight / data.itemWeight;
      data.noOfItems = noOfItems;
      if (id) {
        const res = await updateCarton({ cartonId: id, ...data });
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
        }
      } else {
        const res = await addCarton(data);
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
        }
      }

      reset();
      navigate("/carton");
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <div className="row ">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <h5 className="text-maincolor mb-4">{id ? "Update" : "Add"} Carton</h5>
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
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                aria-describedby="carton name"
                {...register("name", {
                  required: "Name is required",
                })}
                style={{ position: "relative" }}
              />
              <ErrorMessage field={errors.name} />
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
                Weight of per Box
              </label>
              <input
                type="text"
                className="form-control"
                id="noOfItems"
                aria-describedby="carton noOfItems"
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
