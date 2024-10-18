"use client";
import { ROLES } from "@/common/constant.common";
import { ViewSalesTeam, ViewUsers } from "./_components/Viewusers";
import { useProfile } from "@/services/user.service";
import Header from "@/layout/header";
import MainContainer from "@/layout/MainContainer";
import SetHeaderName from "@/components/SetHeaderName";
import style from "@/app/(auth)/(dashboard)/dashboard.module.scss";

export default function Home() {
  const { data: userData } = useProfile();
  const userRole = userData?.role;

  return (
    <>
      <SetHeaderName name="Dashboard" />
      {/* <div className="row">
        <div className="col">
          <div className="d-flex align-items-center">
            <div className="flex-fill">
              <h4 className="mb-0">Dashboard</h4>
            </div>
          </div>
        </div>
      </div> */}
      <div className={style.inner_content}>
        <div className="row">
          <div className="col">
            <div className="d-flex align-items-center">
              <div className="flex-fill">
                <h5 className={`mb-0 mt-3 text-maincolor ${style.heading}`}>Dashboard</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
