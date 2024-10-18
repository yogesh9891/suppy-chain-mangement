import { useQuery } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";

const baseUrl = `${url}/v1/distributorEnquiry`;

const getDistributorInquiries = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<any>>(`${baseUrl}?${query}`);
};

export const useDistributorInquiries = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["distributorInquiries", pagination, searchObj],
    queryFn: () => getDistributorInquiries(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
