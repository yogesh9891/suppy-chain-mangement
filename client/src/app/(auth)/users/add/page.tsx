"use client";
import Link from "next/link";
import { useRedirectIfNoValidRole, useRoleFromParams } from "../_users.utils/hooks";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { PartialUser, useAddUser, useProfile, useUser } from "@/services/user.service";
import { toastError } from "@/utils/toast";
import { useNavigate } from "@/hooks/useNavigate";
import { ROLES, ROLES_TYPE } from "@/common/constant.common";
import Select, { SingleValue } from "react-select";
import { useCountry } from "@/services/country.service";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useArea } from "@/services/area.service";
import { useCity } from "@/services/city.service";
import { useStates } from "@/services/state.service";
import SetHeaderName from "@/components/SetHeaderName";
import { useCurrentRole } from "@/customhooks/useCurrentRole";
import { useEffect } from "react";
import { useZone } from "@/services/zone.service";

type Inputs = {
  name: string;
  phone: string;
  email: string;
  password: string;
  countryId?: string;
  countryName?: string;
  stateId?: string;
  stateName?: string;
  cityId?: string;
  cityName?: string;
  zoneId?: string;
  zoneName?: string;
  areaId?: string;
  gstNo?: string;
  areaName?: string;
  pincode?: string;
  address?: string;
  storeId?: string;
  storeName?: string;
};

export default function Page() {
  const role = useRoleFromParams();
  useRedirectIfNoValidRole();
  const profile = useProfile();

  console.log(profile.data, "profileprofileprofileprofileprofile");
  const admiRole = useCurrentRole();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
    formState,
    getValues,
  } = useForm<Inputs>();

  const countryId = watch("countryId");
  const stateId = watch("stateId");
  const cityId = watch("cityId");
  const areaId = watch("areaId");
  const storeId = watch("storeId");

  const { data: country } = useCountry({}, false);
  const processedCountryData = useProcessData(country);

  const { data: states } = useStates({ countryId }, false, !!countryId);
  const processedStatesData = useProcessData(states);

  const { data: citys } = useCity({ countryId, stateId }, false, !!countryId && !!stateId);
  const processedCityData = useProcessData(citys);

  const { data: areas } = useArea({ countryId, stateId, cityId }, false, !!countryId && !!stateId && !!cityId);
  const processedAreaData = useProcessData(areas);

    const { data: zones } = useZone({  }, false);
  const processedZoneData = useProcessData(zones);

  const {
    data: users,
    isFetching,
    isLoading,
    refetch,
  } = useUser({ role: role == ROLES.EMPLOYEE ? ROLES.STORE : ROLES.USER }, false);

  const processedUserData = useProcessData(users);

  const { mutateAsync } = useAddUser();

  const navigate = useNavigate();

  // useEffect(() => {
  //   if (profile?.data) {
  //     setValue("storeId", profile?.data._id);
  //     setValue("storeName", profile?.data?.storeName);
  //   }
  // }, [profile]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      // process data? extra validations etc
      if (!role || !Object.keys(ROLES).includes(role)) {
        throw new Error("Role not found");
      }
      let obj: PartialUser = {
        ...data,
        role: role as ROLES_TYPE,
      };

      if (!obj.areaId) {
        delete obj.areaId;
        delete obj.areaName;
      }
      if (!obj.cityId) {
        delete obj.cityId;
        delete obj.cityName;
        delete obj.areaId;
        delete obj.areaName;
      }
      if (!obj.stateId) {
        delete obj.stateId;
        delete obj.stateName;
        delete obj.cityId;
        delete obj.cityName;
        delete obj.areaId;
        delete obj.areaName;
      }

      if (!obj.countryId) {
        delete obj.countryId;
        delete obj.countryName;
        delete obj.stateId;
        delete obj.stateName;
        delete obj.cityId;
        delete obj.cityName;
        delete obj.areaId;
        delete obj.areaName;
      }

      const res = await mutateAsync(obj);
      reset();
      navigate(`/users?role=${role}`);
    } catch (error) {
      toastError(error);
    }
  };
  const handleCountryChange = (
    val: SingleValue<{
      label: string | undefined;
      value: string | undefined;
    }>,
  ) => {
    if (val) {
      setValue("countryId", val.value);
      setValue("countryName", val.label);
      setValue("stateId", "");
      setValue("stateName", "");
      setValue("cityId", "");
      setValue("cityName", "");
      setValue("areaId", "");
      setValue("areaName", "");
    } else {
      setValue("countryId", "");
      setValue("countryName", "");
      setValue("stateId", "");
      setValue("stateName", "");
      setValue("cityId", "");
      setValue("cityName", "");
      setValue("areaId", "");
      setValue("areaName", "");
    }
  };

  const handleStateChange = (
    val: SingleValue<{
      label: string | undefined;
      value: string | undefined;
    }>,
  ) => {
    if (val) {
      setValue("stateId", val.value);
      setValue("stateName", val.label);
      setValue("cityId", "");
      setValue("cityName", "");
      setValue("areaId", "");
      setValue("areaName", "");
    } else {
      setValue("stateId", "");
      setValue("stateName", "");
      setValue("cityId", "");
      setValue("cityName", "");
      setValue("areaId", "");
      setValue("areaName", "");
    }
  };

  const handleCityChange = (
    val: SingleValue<{
      label: string | undefined;
      value: string | undefined;
    }>,
  ) => {
    if (val) {
      setValue("cityId", val.value);
      setValue("cityName", val.label);
      setValue("areaId", "");
      setValue("areaName", "");
    } else {
      setValue("cityId", "");
      setValue("cityName", "");
      setValue("areaId", "");
      setValue("areaName", "");
    }
  };

  const handleAreaChange = (
    val: SingleValue<{
      label: string | undefined;
      value: string | undefined;
    }>,
  ) => {
    if (val) {
      setValue("areaId", val.value);
      setValue("areaName", val.label);
    } else {
      setValue("areaId", "");
      setValue("areaName", "");
    }
  };
  const handleZoneChange = (
    val: SingleValue<{
      label: string | undefined;
      value: string | undefined;
    }>,
  ) => {
    if (val) {
      setValue("zoneId", val.value);
      setValue("zoneName", val.label);
    } else {
      setValue("zoneId", "");
      setValue("zoneName", "");
    }
  };
  const handleStoreChange = (
    val: SingleValue<{
      label: string | undefined;
      value: string | undefined;
    }>,
  ) => {
    if (val) {
      setValue("storeId", val.value);
      setValue("storeName", val.label);
      setValue("countryId", "");
      setValue("countryName", "");
      setValue("stateId", "");
      setValue("stateName", "");
      setValue("cityId", "");
      setValue("cityName", "");
      setValue("areaId", "");
      setValue("areaName", "");
    } else {
      setValue("countryId", "");
      setValue("countryName", "");
      setValue("storeId", "");
      setValue("storeName", "");
      setValue("stateId", "");
      setValue("stateName", "");
      setValue("cityId", "");
      setValue("cityName", "");
      setValue("areaId", "");
      setValue("areaName", "");
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
      <SetHeaderName name={`Add ${role}`} />
      <div className="col">
        <div className="row">
          <div className="col">
            <div className="global_shadow_border global_padding">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  <div className="col">
                    <div className="d-flex align-items-center">
                      <div className="flex-fill">{/* <h4 className="mb-0">Add {role}</h4> */}</div>
                      <div>
                        <Link href={`/users?role=${role}`} className="btn btn-maincolor">
                          View {role}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col">
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
                        aria-describedby="name"
                        {...register("name", {
                          required: true,
                        })}
                        style={{ position: "relative" }}
                      />
                    </div>
                    <div className="mb-4 position-relative">
                      <label
                        htmlFor="phone"
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
                        Phone
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="phone"
                        {...register("phone", {
                          min: 10,
                          maxLength: 10,
                          required: true,
                        })}
                        aria-describedby="phone"
                        style={{ position: "relative" }}
                      />
                    </div>
                    {role !== ROLES.SALES  && (
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
                          GST No
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="gstNo"
                          aria-describedby="gstNo"
                          {...register("gstNo")}
                          style={{ position: "relative" }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="col">
                    <div className="mb-4 position-relative">
                      <label
                        htmlFor="exampleInputEmail1"
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
                        Email address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="exampleInputEmail1"
                        aria-describedby="emailHelp"
                        {...register("email")}
                        style={{ position: "relative" }}
                      />
                    </div>
                    <div className="mb-4 position-relative">
                      <label
                        htmlFor="exampleInputPassword1"
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
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="exampleInputPassword1"
                        {...register("password")}
                        style={{ position: "relative" }}
                      />
                    </div>
                  </div>
                </div>

                {role === ROLES.STORE && (
                  <div className="row">
                    <div className="col">
                      <h6 className="mb-4">Location Mapping :-</h6>

                      <div className="row">
                        <div className="col-6">
                          <div className="mb-4 position-relative">
                            <label
                              htmlFor="storeName"
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
                              Store Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="storeName"
                              aria-describedby="storeName"
                              {...register("storeName", {
                                required: true,
                              })}
                              style={{ position: "relative" }}
                            />
                          </div>
                        </div>
                        <div className="col-6">
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
                            <Controller
                              name="countryId"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={processedCountryData.rows.map((el) => ({ label: el.name, value: el._id }))}
                                  value={{
                                    label: watch("countryName"),
                                    value: watch("countryId"),
                                  }}
                                  styles={styling}
                                  isClearable={false}
                                  onChange={handleCountryChange}
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="mb-4 position-relative">
                            <label
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
                            <Controller
                              name="stateId"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={processedStatesData.rows.map((el) => ({ label: el.name, value: el._id }))}
                                  value={{
                                    label: watch("stateName"),
                                    value: watch("stateId"),
                                  }}
                                  styles={styling}
                                  isClearable={false}
                                  onChange={handleStateChange}
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="mb-4 position-relative">
                            <label
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
                              City
                            </label>
                            <Controller
                              name="countryId"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={processedCityData.rows.map((el) => ({ label: el.name, value: el._id }))}
                                  value={{
                                    label: watch("cityName"),
                                    value: watch("cityId"),
                                  }}
                                  styles={styling}
                                  isClearable={false}
                                  onChange={handleCityChange}
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="mb-4 position-relative">
                            <label
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
                              Area
                            </label>
                            <Controller
                              name="areaId"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={processedAreaData.rows.map((el) => ({ label: el.name, value: el._id }))}
                                  value={{
                                    label: watch("areaName"),
                                    value: watch("areaId"),
                                  }}
                                  styles={styling}
                                  isClearable={false}
                                  onChange={handleAreaChange}
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="mb-4 position-relative">
                            <label
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
                              Zone
                            </label>
                            <Controller
                              name="zoneId"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={processedZoneData.rows.map((el) => ({ label: el.name, value: el._id }))}
                                  value={{
                                    label: watch("zoneName"),
                                    value: watch("zoneId"),
                                  }}
                                  styles={styling}
                                  isClearable={false}
                                  onChange={handleZoneChange}
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="col-6">
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
                              Address
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="address"
                              aria-describedby="address"
                              {...register("address", {
                                required: true,
                              })}
                              style={{ position: "relative" }}
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="mb-4 position-relative">
                            <label
                              htmlFor="pincode"
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
                              Pincode
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="pincode"
                              {...register("pincode", {
                                min: 10,
                                maxLength: 10,
                                required: true,
                              })}
                              aria-describedby="pincode"
                              style={{ position: "relative" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {role === ROLES.EMPLOYEE && admiRole != ROLES.STORE && (
                  <div className="row">
                    <div className="col">
                      <h6 className="mb-4">Store Mapping :-</h6>

                      <div className="row">
                        <div className="col-6">
                          <div className="mb-4 position-relative">
                            <label
                              htmlFor="storeId"
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
                                  options={processedUserData.rows.map((el) => ({ label: el.storeName, value: el._id }))}
                                  value={{
                                    label: watch("storeName"),
                                    value: watch("storeId"),
                                  }}
                                  styles={styling}
                                  isClearable={false}
                                  onChange={handleStoreChange}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="row mt-4">
                  <div className="col">
                    <button type="submit" className="btn btn-maincolor">
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
