"use client";
import React from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { useAddCompany } from "@/services/company.service";
import { toastError, toastSuccess } from "@/utils/toast";
import { SubmitHandler, useForm } from "react-hook-form";
import Form from "react-bootstrap/Form";
import { Button } from "react-bootstrap";
import { HiOutlinePhotograph } from "react-icons/hi";

type Inputs = {
  name: string;
};

export default function AddCompany() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>();

  const { mutateAsync } = useAddCompany();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const res = await mutateAsync(data);
      if (res.data.data) {
        toastSuccess(res.data.message);
      }
      reset();
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <div className="row">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <h5 className="text-maincolor mb-4">Add Company</h5>
          <div className="row">
            <div className="col">
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3 position-relative" controlId="name">
                  <Form.Label  style={{ position: 'absolute', zIndex: '1', background: '#fff', top: '-13px', left: '12px', padding: '0px 5px' }}>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Company Name..."
                    {...register("name", {
                      required: "Name is required",
                    })}
                  />
                  <ErrorMessage field={errors.name} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="images">
                  <Form.Label>Choose Image <HiOutlinePhotograph /></Form.Label>
                  <Form.Control type="file" multiple style={{background:'transparent !important'}}/>
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
