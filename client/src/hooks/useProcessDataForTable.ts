import { GeneralApiResponsePagination } from "@/services/url.service";
import { useMemo } from "react";

export function useProcessData<T = unknown>(data: GeneralApiResponsePagination<T> | undefined) {
  const rows = useMemo(() => {
    if (data) {
      return data.data;
    }
    return [];
  }, [data]);
  const total = useMemo(() => {
    if (data) {
      return data.total;
    }
    return 0;
  }, [data]);
  return {
    rows,
    total,
  };
}

export function useLoading(...args: boolean[]) {
  return args.some((el) => el);
}
