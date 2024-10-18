import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponse, GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IUser } from "./user.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/color`;

export interface IColor {
  _id: string;
  name: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
}

type PartialColor = Partial<IColor>;

const addColor = (color: PartialColor) => {
  return axios.post(`${baseUrl}/`, color);
};

export const useAddColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addColor,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["color"] });
    },
  });
};

const getColor = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IColor>>(`${baseUrl}/?${query}`);
};

export const useColor = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["color", pagination, searchObj],
    queryFn: () => getColor(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getColorById = (colorId: string) => {
  return axios.get<GeneralApiResponse<IColor>>(`${baseUrl}/getById/${colorId}`);
};

export const useColorById = (colorId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["colorById", colorId],
    queryFn: () => getColorById(colorId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateColor = ({ colorId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${colorId}`, obj);
};

export const useUpdateColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateColor,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["color"] });
      queryClient.invalidateQueries({ queryKey: ["colorById"] });
    },
  });
};

const deleteColor = (colorId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${colorId}`);
};

export const useDeleteColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteColor,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["color"] });
      // toastSuccess(res);
    },
  });
};
