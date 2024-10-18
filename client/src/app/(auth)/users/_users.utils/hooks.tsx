"use client";
import { ROLES } from "@/common/constant.common";
import { useNavigate } from "@/hooks/useNavigate";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export const useRoleFromParams = () => {
  const searchParams = useSearchParams();

  const role = useMemo(() => {
    return searchParams.get("role");
  }, [searchParams]);

  return role;
};

export const useRedirectIfNoValidRole = (redirectUrl = "/") => {
  const navigate = useNavigate();
  const role = useRoleFromParams();

  if (!role || !Object.keys(ROLES).includes(role)) {
    navigate(redirectUrl);
  }
};
