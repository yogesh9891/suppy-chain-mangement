import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponse, GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IUser } from "./user.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/brand`;

export interface IBrand {
  _id: string;
  name: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
}

type PartialBrand = Partial<IBrand>;

const addBrand = (brand: PartialBrand) => {
  return axios.post(`${baseUrl}/`, brand);
};

export const useAddBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBrand,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["brand"] });
    },
  });
};

const getBrand = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IBrand>>(`${baseUrl}/?${query}`);
};

export const useBrand = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["brand", pagination, searchObj],
    queryFn: () => getBrand(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getBrandById = (brandId: string) => {
  return axios.get<GeneralApiResponse<IBrand>>(`${baseUrl}/getById/${brandId}`);
};

export const useBrandById = (brandId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["brandById", brandId],
    queryFn: () => getBrandById(brandId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateBrand = ({ brandId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${brandId}`, obj);
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateBrand,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["brand"] });
      queryClient.invalidateQueries({ queryKey: ["brandById"] });
    },
  });
};

const deleteBrand = (brandId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${brandId}`);
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["brand"] });
      // toastSuccess(res);
    },
  });
};
