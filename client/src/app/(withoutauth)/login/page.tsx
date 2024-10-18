"use client";
import ErrorMessage from "@/components/ErrorMessage";
import { useNavigateReplace } from "@/hooks/useNavigate";
import { toastError } from "@/utils/toast";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

export const dynamic = "force-static";

type Inputs = {
  email: string;
  password: string;
};

export default function Login() {
  const session = useSession();
  const searchParams = useSearchParams();
  const navigate = useNavigateReplace();

  useEffect(() => {
    if (session.status == "authenticated") {
      const redirect_url = searchParams.get("redirect_url");
      if (redirect_url) {
        if (redirect_url.includes("https")) {
          setTimeout(() => {
            if (window) {
              window.location.href = redirect_url;
            }
          }, 300);
        } else {
          navigate(redirect_url);
        }
      } else {
        navigate("/");
      }
    }
  }, [session.status, navigate, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const res = await signIn("credentials", { ...data, redirect: false });
      console.log(res);
      if (res?.error) {
        toastError(res.error);
      }
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <div className="container ">
      <div className="row ">
        <div className="col vh-100 align-items-center justify-content-center d-flex ">
          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "50px", border: "solid 1px #000" }}>
            <div>
              <h4>Login</h4>
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputEmail1">Email/Phone</label>
              <input
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                placeholder="Enter Email/Phone"
                {...register("email", {
                  required: "Email/Phone is required",
                })}
              />

              <ErrorMessage field={errors.email} />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="exampleInputPassword1">Password</label>
              <input
                type="password"
                className="form-control"
                id="exampleInputPassword1"
                placeholder="Password"
                {...register("password", { required: "Password is required" })}
              />

              <ErrorMessage field={errors.password} />
            </div>
            <button type="submit" className="btn btn-maincolor mt-4">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
