"use client";
import ErrorMessage from "@/components/ErrorMessage";
import { useNavigate } from "@/hooks/useNavigate";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useCountry } from "@/services/country.service";
import { useAddState, useStateById, useUpdateState } from "@/services/state.service";
import { toastError, toastSuccess } from "@/utils/toast";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Select from "react-select";

type Inputs = {
  name: string;
  // countryId: string;
};
export default function AddState({ id }: { id: any }) {
  //IMPORTS
  const navigate = useNavigate();

  //STATE
  const [countryId, setCountryId] = useState("");
  const [countryName, setCountryName] = useState("");
  const [isMounted, setIsMounted] = useState(false); //To solve warnings. [Select]
  const [name, setName] = useState("");

  //DATA
  const { data: state } = useStateById(id, !!id);
  const { data: country } = useCountry({}, false);
  const processedCountryData = useProcessData(country);

  //MUTANT
  const { mutateAsync: addState } = useAddState();
  const { mutateAsync: updateState } = useUpdateState();

  //USEEFFECT
  useEffect(() => setIsMounted(true), []);
  useEffect(() => {
    if (id && state) {
      setCountryName(state?.countryName);
      setCountryId(state?.countryId);
      setName(state?.name);
    }
  }, [id, state]);

  //HOOK FORM
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    values: { name: name },
  });

  //SUBMIT HANDLER
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      if (!countryId) {
        throw new Error("Select a country");
      }

      // process data? extra validations etc
      let obj = {
        ...data,
        countryId,
        countryName,
      };

      if (id) {
        const res = await updateState({ ...obj, stateId: id });
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
          setName("");
          setCountryId("");
          setCountryName("");
        }
      } else {
        const res = await addState(obj);
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
        }
      }
      reset();
      navigate("/states");
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
          <h5 className="text-maincolor mb-4">Add State</h5>
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
                aria-describedby="state name"
                {...register("name", {
                  required: "Name is required",
                })}
                style={{ position: "relative" }}
              />
            </div>
            <ErrorMessage field={errors.name} />

            <div className="mb-4 position-relative">
              <label
                htmlFor="country"
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
                Country
              </label>
              {isMounted && (
                <Select
                  options={processedCountryData.rows.map((el) => ({ label: el.name, value: el._id }))}
                  value={{
                    label: countryName,
                    value: countryId,
                  }}
                  styles={styling}
                  isClearable={false}
                  onChange={(val) => {
                    if (val) {
                      setCountryId(val?.value);
                      setCountryName(val?.label);
                    } else {
                      setCountryId("");
                      setCountryName("");
                    }
                  }}
                />
              )}
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
