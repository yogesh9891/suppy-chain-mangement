"use client";
import { useUpdatePassword, useUpdateProfileImage, useUpdateUser, useUserById } from "@/services/user.service";
import React, { useEffect, useMemo, useState } from "react";
import { Table as BTable, Modal } from "react-bootstrap";
import Image from "next/image";
import { generateFilePath } from "@/services/url.service";
import { GoPencil, GoCheck, GoCircleSlash } from "react-icons/go";
import { toastError, toastSuccess } from "@/utils/toast";
import moment from "moment";
import { ROLES } from "@/common/constant.common";
import { useCurrentRole } from "@/customhooks/useCurrentRole";

export default function UserInfo({ id }: { id: string }) {

  const role = useCurrentRole();

  //DATA
  const { data: userData }: any = useUserById(id);

  //STATES
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isUpateImage, setIsUpdateImage] = useState<boolean>(false);
  const [isChangePass, setIsChangePass] = useState<boolean>(false);
  const [isUpdateTarget, setIsUpdateTarget] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [targetPc, setTargetPc] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confPassword, setConfPassword] = useState<string>("");

  //MUTANTS
  const { mutateAsync: updateUser } = useUpdateUser();
  const { mutateAsync: updateProfileImage } = useUpdateProfileImage();
  const { mutateAsync: updatePassword } = useUpdatePassword();

  //HANDLERS
  const handleEdit = async (e: any) => {
    try {
      console.log(e?.target?.id);
      if (e?.target?.id === "edit") {
        setName(userData?.name);
        setEmail(userData?.email);
        setPhone(userData?.phone);
        setAddress(userData?.address);
        if (role == ROLES.ADMIN) {
           setIsEdit(true);
        }
      } else if (e?.target?.id === "submit") {
        if (!name) {
          toastError("Name can't be empty.");
          return;
        }
        if (!email) {
          toastError("Email can't be empty.");
          return;
        }
        if (!phone) {
          toastError("Phone can't be empty.");
          return;
        }
        if (!address) {
          toastError("Address can't be empty.");
          return;
        }

        if (phone?.length !== 10) {
          toastError("Phone should be 10 digits");
          return;
        }

        const res = await updateUser({ name, email, phone, address, userId: userData?._id });
        if (res.data?.message) {
          toastSuccess(res.data?.message);
          setIsEdit(false);
        }
      } else if (e?.target?.id === "cancel") {
        setIsEdit(false);
        setEmail(userData?.email);
        setName(userData?.name);
        setPhone(userData?.phone);
        setAddress(userData?.address);
      }
    } catch (error) {
      toastError(error);
    }
  };
  const handleImageOnChange = async (e: any) => {
    try {
      const file = e?.target?.files[0];
      const base64 = await setFileToBase(file);
      if (typeof base64 === "string") {
        setImage(base64);
      }
    } catch (error) {
      toastError(error);
    }
  };
  const setFileToBase = (file: any) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const result = reader?.result;
        resolve(result);
      };
    });
  };
  const handleSubmitImage = async () => {
    try {
      if (!image) throw new Error("Choose an image.");
      const res = await updateProfileImage({ userId: userData?._id, profileImage: image });
      if (res.data?.message) {
        toastSuccess(res?.data?.message);
        setImage("");
        setIsUpdateImage(false);
      }
    } catch (error) {
      toastError(error);
    }
  };
  const handleSubmitPassword = async () => {
    try {
      if (!password) throw new Error("Password can't be empty!");
      if (!confPassword) throw new Error("confirm password!");
      if (password !== confPassword) throw new Error("Passwords should be match.");

      const res = await updatePassword({ userId: userData?._id, newPassword: password });
      if (res.data.message) {
        toastSuccess(res.data.message);
        setPassword("");
        setConfPassword("");
        setIsChangePass(false);
      }
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <div className="global_shadow_border global_margin global_padding d-flex align-items-center gap-4 position-relative">
            <div className="col-2 position-relative " style={{ maxWidth: "fit-content" }}>
              <Image
                src={
                  userData?.profileImage ? generateFilePath(userData?.profileImage) : require("@/assets/img/Avatar.png")
                }
                style={{ objectFit: "cover", borderRadius: 10 }}
                width={100}
                height={100}
                alt="profile"
              />
              <div
                className="rounded-circle d-flex align-items-center justify-content-center cursor-pointer  bg-body-secondary position-absolute top-0 end-0"
                onClick={() => setIsUpdateImage(true)}
                role="button"
              >
                <GoPencil style={{ padding: 5 }} size={25} />
              </div>
            </div>
            <div className="col-8 align-items-center">
              <BTable hover responsive size="sm">
                <thead>
                  <tr className="info_row">
                    <th>Id: </th>
                    <th>{userData?.id}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="info_row">
                    <td style={{ fontSize: 14 }}>Name:</td>
                    <td style={{ fontSize: 14 }}>
                      {isEdit ? (
                        <input
                          type="text"
                          className="form-control"
                          value={name}
                          onChange={(e: any) => setName(e.target.value)}
                          disabled={!isEdit}
                          style={{ height: "35px" }}
                        />
                      ) : (
                        userData?.name
                      )}
                    </td>
                  </tr>
                  <tr className="info_row">
                    <td style={{ fontSize: 14 }}>Email:</td>
                    <td style={{ fontSize: 14 }}>
                      {isEdit ? (
                        <input
                          type="text"
                          className="form-control"
                          value={email}
                          onChange={(e: any) => setEmail(e.target.value)}
                          disabled={!isEdit}
                          style={{ height: "35px" }}
                        />
                      ) : (
                        userData?.email
                      )}
                    </td>
                  </tr>
                  <tr className="info_row">
                    <td style={{ fontSize: 14 }}>Phone:</td>
                    <td style={{ color: "#7d7d7d", fontSize: 14 }}>
                      {isEdit ? (
                        <input
                          type="text"
                          className="form-control"
                          value={phone}
                          onChange={(e: any) => setPhone(e.target.value)}
                          disabled={!isEdit}
                          style={{ height: "35px" }}
                        />
                      ) : (
                        userData?.phone
                      )}
                    </td>
                  </tr>
                  <tr className="info_row">
                    <td style={{ fontSize: 14 }}>Address:</td>
                    <td style={{ color: "#7d7d7d", fontSize: 14 }}>
                      {isEdit ? (
                        <input
                          type="text"
                          className="form-control"
                          value={address}
                          onChange={(e: any) => setAddress(e.target.value)}
                          disabled={!isEdit}
                          style={{ height: "35px" }}
                        />
                      ) : (
                        userData?.address
                      )}
                    </td>
                  </tr>
                </tbody>
              </BTable>
              {userData?.role == ROLES.ADMIN && (
                <div
                  className="pointer-event cursor-pointer text-body-info text-decoration-underline text-primary"
                  style={{ fontSize: 14 }}
                  role="button"
                  onClick={() => setIsChangePass(true)}
                >
                  change password?{" "}
                </div>
              )}
            </div>
            <div className="position-absolute top-0 end-0 p-2 pt-3  d-flex flex-row flex-nowrap gap-1">
              <div onClick={handleEdit} role="button">
                {isEdit ? (
                  <div
                    id="submit"
                    className="rounded-circle  p-2 d-flex align-items-center justify-content-center cursor-pointer  bg-body-secondary"
                  >
                    <GoCheck id="submit" />
                  </div>
                ) : (
                  <div
                    id="edit"
                    className="rounded-circle  p-2 d-flex align-items-center justify-content-center cursor-pointer  bg-body-secondary"
                  >
                    <GoPencil id="edit" />
                  </div>
                )}
              </div>
              {isEdit && (
                <div
                  className="rounded-circle  p-2 d-flex align-items-center justify-content-center cursor-pointer bg-body-secondary"
                  onClick={handleEdit}
                  role="button"
                  id="cancel"
                >
                  <GoCircleSlash id="cancel" />
                </div>
              )}
            </div>
          </div>
          {/* <UserTarget id={id} /> */}
        </div>
        <Modal show={isUpateImage} onHide={() => setIsUpdateImage(false)}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "20px" }}>Upload new profile.</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex gap-1 ">
              <input className="form-control" onChange={handleImageOnChange} type="file" />
              <button className="btn btn-maincolor" type="submit" onClick={handleSubmitImage}>
                Submit
              </button>
            </div>
          </Modal.Body>
        </Modal>
        <Modal show={isChangePass} onHide={() => setIsChangePass(false)}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "20px" }}>Upload new profile.</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex gap-1 flex-column">
              <input
                value={password}
                type="text"
                placeholder="New password"
                className="form-control"
                onChange={(e: any) => setPassword(e.target.value)}
              />
              <input
                value={confPassword}
                type="text"
                placeholder="Confirm password"
                className="form-control"
                onChange={(e: any) => setConfPassword(e.target.value)}
              />
              <button className="btn btn-maincolor" type="submit" onClick={handleSubmitPassword}>
                Submit
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
