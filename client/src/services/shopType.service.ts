import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";

const baseUrl = `${url}/v1/shoptype`; // update.

export interface IShopType {
  name: string;
  createdById: string;
  createdByRole: string;
  isDeleted: boolean;
  deletedById: string;
  deletedByRole: string;
  deletedOn: Date;
}

type PartialShopType = Partial<IShopType>;

const addShopType = (obj: PartialShopType) => {
  return axios.post(`${baseUrl}/`, obj);
};

export const useAddShopTypes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addShopType,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["shoptypes"] });
    },
  });
};

const getShopTypes = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IShopType>>(`${baseUrl}?${query}`);
};

export const useShopTypes = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["shoptypes", pagination, searchObj],
    queryFn: () => getShopTypes(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
