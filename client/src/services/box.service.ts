import { toastError, toastSuccess } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";

const baseUrl = `${url}/v1/box`;

export interface IBox {
  _id: string;
  name: string;
  weight: number;
  noOfItems: number;
  barCode: string;
  cartonId: string;
  cartonName: string;
  createdAt: Date;
  updateAt: Date;
}

type PartialBox = Partial<IBox>;

const addBox = (box: PartialBox) => {
  return axios.post(`${baseUrl}`, box);
};

export const useAddBox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBox,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["box"] });
      // toastSuccess(res);
    },
  });
};

const getBox = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IBox>>(`${baseUrl}?${query}`);
};

export const useBoxs = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["box", pagination, searchObj],
    queryFn: () => getBox(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getBoxById = (boxId: string) => {
  return axios.get<GeneralApiResponse<IBox>>(`${baseUrl}/getById/${boxId}`);
};

export const useBoxById = (boxId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["boxById", boxId],
    queryFn: () => getBoxById(boxId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateBox = ({ boxId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${boxId}`, obj);
};

export const useUpdateBox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateBox,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["box"] });
      queryClient.invalidateQueries({ queryKey: ["boxById"] });
    },
  });
};

const deleteBox = (boxId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${boxId}`);
};

export const useDeleteBox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBox,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["box"] });
    },
  });
};
