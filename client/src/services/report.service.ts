import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponsePagination, url } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";

const baseUrl = `${url}/v1/reports`;

const enqueReport = (obj: any) => {
  return axios.post(`${baseUrl}/enquee`, obj);
};

export const useEnqueeReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enqueReport,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["order_reports"] });
    },
  });
};

const getReport = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<any>>(`${baseUrl}?${query}`);
};

export const useReports = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["order_reports", pagination, searchObj],
    queryFn: () => getReport(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
