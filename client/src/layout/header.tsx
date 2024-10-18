"use client";
import { useProfile } from "@/services/user.service";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { GoChevronLeft } from "react-icons/go";
import headerstyles from "./header.module.scss";
import { GoPerson } from "react-icons/go";
import { GoArrowLeft } from "react-icons/go";
import { useHeaderName } from "@/customhooks/useHeaderName";

export default function Header() {
  const { data: profile } = useProfile();

  const router = useRouter();
  const pathName = usePathname();

  const headerName = useHeaderName();

  const logout = () => {
    signOut();
  };

  return (
    <nav className={`navbar navbar-expand-lg ${headerstyles.header_container}`}>
      <div className="container-fluid">
        {/* <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button> */}
        {/* <ul className="navbar-nav me-auto mb-2 mb-lg-0"> */}
        <div className="navbar-nav me-auto mb-2 mb-lg-0">
          {pathName !== "/" && (
            <button type="button" onClick={() => router.back()} className="btn">
              <div className={headerstyles.icon_container}>
                <GoArrowLeft />
              </div>
            </button>
          )}
          <div className="d-flex align-items-center justify-content-center">
            <h1 className={headerstyles.header_title}>{headerName}</h1>
          </div>
        </div>
        {/* <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#">
                Home
              </a>
            </li> */}
        {/* <li className="nav-item">
              <a className="nav-link" href="#">
                Link
              </a>
            </li> */}
        {/* </ul> */}
        <div className="btn-group">
          <button
            type="button"
            className={`btn dropdown-toggle ${headerstyles.user_dropdown}`}
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div className={headerstyles.icon_container}>
              <GoPerson />
            </div>
            {profile?.name} ({profile?.role})
          </button>
          <ul className={`${headerstyles.dropdown} dropdown-menu dropdown-menu-end`}>
            <li>
              <button className={`${headerstyles.item} dropdown-item`} type="button" onClick={logout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
