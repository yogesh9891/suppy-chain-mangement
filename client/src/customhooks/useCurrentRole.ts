import { useProfile } from "@/services/user.service";
import { useMemo } from "react";

export function useCurrentRole() {
  const { data: profile } = useProfile();

  const role = useMemo(() => {
    return profile?.role;
  }, [profile?.role]);

  return role;
}
