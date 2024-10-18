"use client";
import ErrorMessage from "@/components/ErrorMessage";
import { useNavigate } from "@/hooks/useNavigate";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useCountry } from "@/services/country.service";
import { useStates } from "@/services/state.service";
import { useAddCity, useCityById, useUpdateCity } from "@/services/city.service";
import { toastError, toastSuccess } from "@/utils/toast";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Select from "react-select";

type Inputs = {
  name: string;
  // countryId: string;
};
export default function AddCity({ id }: { id: any }) {
  //IMPORTS
  const navigate = useNavigate();

  const { data: city }: any = useCityById(id, !!id);

  const { data: country } = useCountry({}, false);
  const processedCountryData = useProcessData(country);

  const [countryId, setCountryId] = useState("");
  const [countryName, setCountryName] = useState("");

  const { data: states } = useStates({ countryId }, false, !!countryId);
  const processedStatesData = useProcessData(states);

  const [stateId, setStateId] = useState("");
  const [stateName, setStateName] = useState("");

  const [isMounted, setIsMounted] = useState(false); //To solve warnings. [Select]
  const [name, setName] = useState("");

  const { mutateAsync: addCity } = useAddCity();
  const { mutateAsync: updateCity } = useUpdateCity();

  //USEEFFECT
  useEffect(() => setIsMounted(true), []);
  useEffect(() => {
    if (id && city) {
      setCountryName(city?.countryName);
      setCountryId(city?.countryId);
      setStateName(city?.stateName);
      setStateId(city?.stateId);
      setName(city?.name);
    }
  }, [id, city]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    values: { name: name },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      if (!countryId) {
        throw new Error("Select a country");
      }

      if (!stateId) {
        throw new Error("Select a state");
      }

      // process data? extra validations etc
      let obj = {
        ...data,
        countryId,
        countryName,
        stateId,
        stateName,
      };

      if (id) {
        const res = await updateCity({ ...obj, cityId: id });
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
          setName("");
          setCountryId("");
          setCountryName("");
          setStateId("");
          setStateName("");
        }
      } else {
        const res = await addCity(obj);
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
        }
      }

      reset();
      navigate("/city");
    } catch (error) {
      toastError(error);
    }
  };

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
          <h5 className="text-maincolor mb-4">Add City</h5>
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
                aria-describedby="city name"
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
                      setStateId("");
                      setStateName("");
                    } else {
                      setCountryId("");
                      setCountryName("");
                    }
                  }}
                />
              )}
            </div>

            <div className="mb-4 position-relative">
              <label
                htmlFor="region"
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
                Region
              </label>
            </div>

            <div className="mb-4 position-relative">
              <label
                htmlFor="region"
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
                State
              </label>
              {isMounted && (
                <Select
                  options={processedStatesData.rows.map((el) => ({ label: el.name, value: el._id }))}
                  value={{
                    label: stateName,
                    value: stateId,
                  }}
                  styles={styling}
                  isClearable={false}
                  onChange={(val) => {
                    if (val) {
                      setStateId(val?.value);
                      setStateName(val?.label);
                    } else {
                      setStateId("");
                      setStateName("");
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
