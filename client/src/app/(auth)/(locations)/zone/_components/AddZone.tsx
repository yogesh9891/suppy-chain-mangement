"use client";
import ErrorMessage from "@/components/ErrorMessage";
import { useNavigate } from "@/hooks/useNavigate";
import { useAddZone, useZoneById, useUpdateZone } from "@/services/zone.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
  name: string;
};
export default function AddZone({ id }: { id: any }) {
  //IMPORTS
  const navigate = useNavigate();

  //DATA
  const { data: zone } = useZoneById(id, !!id);

  //MUTANTS
  const { mutateAsync: addZone } = useAddZone();
  const { mutateAsync: updateZone } = useUpdateZone();

  const [name, setName] = useState("");

  useEffect(() => {
    if (id && zone) {
      setName(zone?.name);
    }
  }, [id, zone]);

  //HOOK FORMS
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    values: { name: name },
  });

  //HANDLERS
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      // process data? extra validations etc

      if (id) {
        const res = await updateZone({ zoneId: id, ...data });
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
          setName("");
        }
      } else {
        const res = await addZone(data);
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
        }
      }

      reset();
      navigate("/zone");
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <div className="row ">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <h5 className="text-maincolor mb-4">{id ? "Update" : "Add"} Zone</h5>
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
                aria-describedby="zone name"
                {...register("name", {
                  required: "Name is required",
                })}
                style={{ position: "relative" }}
              />
            </div>

            <ErrorMessage field={errors.name} />
            <button type="submit" className="btn btn-maincolor mt-3">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
