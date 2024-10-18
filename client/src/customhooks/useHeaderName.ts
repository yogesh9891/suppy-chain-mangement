import { headerNameKey } from "@/common/constant_frontend.common";
import { useNavigateReplace } from "@/hooks/useNavigate";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useHeaderName() {
  const searchParams = useSearchParams();
  const header = useMemo(() => {
    return searchParams.get(headerNameKey);
  }, [searchParams]);
  return header;
}

export function useSetHeaderName() {
  const searchParams = useSearchParams();
  const navigate = useNavigateReplace();
  const pathname = usePathname();

  function setHeaderName(headerName: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(headerNameKey, headerName);
    navigate(pathname + "?" + params.toString());
    // window.history.replaceState(null, "", "?" + params.toString());
  }
  return setHeaderName;
}
