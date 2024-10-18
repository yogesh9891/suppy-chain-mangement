import { PaginationState } from "@tanstack/react-table";
import axios from "./axios.service";
import url, { GeneralApiResponsePagination } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { useQuery } from "@tanstack/react-query";

const baseUrl = `${url}/v1/paymentcollection`;

const getPaymentCollections = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<any>>(`${baseUrl}?${query}`);
};

export const usePaymentCollections = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["payementCollection", pagination, searchObj],
    queryFn: () => getPaymentCollections(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
