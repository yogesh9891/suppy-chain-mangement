import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponse, GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IUser } from "./user.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/size`;

export interface ISize {
  _id: string;
  name: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
}

type PartialSize = Partial<ISize>;

const addSize = (size: PartialSize) => {
  return axios.post(`${baseUrl}/`, size);
};

export const useAddSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSize,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["size"] });
    },
  });
};

const getSize = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<ISize>>(`${baseUrl}/?${query}`);
};

export const useSize = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["size", pagination, searchObj],
    queryFn: () => getSize(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getSizeById = (sizeId: string) => {
  return axios.get<GeneralApiResponse<ISize>>(`${baseUrl}/getById/${sizeId}`);
};

export const useSizeById = (sizeId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["sizeById", sizeId],
    queryFn: () => getSizeById(sizeId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateSize = ({ sizeId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${sizeId}`, obj);
};

export const useUpdateSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateSize,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["size"] });
      queryClient.invalidateQueries({ queryKey: ["sizeById"] });
    },
  });
};

const deleteSize = (sizeId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${sizeId}`);
};

export const useDeleteSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSize,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["size"] });
      // toastSuccess(res);
    },
  });
};
