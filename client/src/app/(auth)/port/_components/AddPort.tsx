"use client";
import ErrorMessage from "@/components/ErrorMessage";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useAddPort, usePortById, useUpdatePort } from "@/services/port.service";
import { useCompany } from "@/services/company.service";
import { toastError, toastSuccess } from "@/utils/toast";
import React, { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Select from "react-select";
import { useZodResolver } from "@/hooks/useZod";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "@/hooks/useNavigate";
import { portSchema } from "../_port.utils/validationSchema";

type Inputs = {
  name: string;
  address: string;
};

export default function AddPort({ id }: { id: any }) {
  //IMPORTS
  const navigate = useNavigate();

  //DATA
  const { data: port } = usePortById(id, !!id);
  const zodResolver = useZodResolver();
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(portSchema),
  });

  const { mutateAsync } = useAddPort();
  const { mutateAsync: updatePort } = useUpdatePort();

  useEffect(() => {
    console.log(id, "sdafhkjdsfhsdjfhsdfjksdfsjkdfsdjk");

    if (id && port) {
      setValue("name", port?.name);
      setValue("address", port?.address);
    }
  }, [id, port]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const newPortData = {
        ...data,
      };

      console.log(newPortData, "sdfdsfsdfsfsdfsdfsdf");

      if (id) {
        const res = await updatePort({ portId: id, ...data });
        if (res.data?.message) {
          toastSuccess(res?.data?.message);
          setValue("name", "");
          setValue("address", "");
        }
      } else {
        const res = await mutateAsync(newPortData);
        if (res.data.data) {
          toastSuccess(res.data.message);
          setValue("name", "");
          setValue("address", "");
        }
      }

      reset();
      navigate("/port");
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
      port: "#09021C !important",
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
          <h5 className="text-mainport mb-4">Add Port</h5>
          <div className="row">
            <div className="col">
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3 position-relative" controlId="name">
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
                    Name
                  </Form.Label>
                  <Form.Control type="text" placeholder="Enter Name..." {...register("name")} />
                  <ErrorMessage field={errors.name} />
                </Form.Group>
                <Form.Group className="mb-3 position-relative" controlId="name">
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
                    Address
                  </Form.Label>
                  <Form.Control type="text" placeholder="Enter Address..." {...register("address")} />
                  <ErrorMessage field={errors.address} />
                </Form.Group>

                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-maincolor">
                    Submit
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
