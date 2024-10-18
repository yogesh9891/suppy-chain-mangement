import { toastError, toastSuccess } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";

const baseUrl = `${url}/v1/area`;

export interface IArea {
  _id: string;
  name: string;
  countryId: string;
  countryName: string;
  stateId: string;
  stateName: string;
  cityId: string;
  cityName: string;
  createdAt: Date;
  updateAt: Date;
}

type PartialArea = Partial<IArea>;

const addArea = (area: PartialArea) => {
  return axios.post(`${baseUrl}`, area);
};

export const useAddArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addArea,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["area"] });
      // toastSuccess(res);
    },
  });
};

const getArea = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IArea>>(`${baseUrl}?${query}`);
};

export const useArea = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["area", pagination, searchObj],
    queryFn: () => getArea(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getAreaById = (areaId: string) => {
  return axios.get<GeneralApiResponse<IArea>>(`${baseUrl}/getById/${areaId}`);
};

export const useAreaById = (areaId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["areaById", areaId],
    queryFn: () => getAreaById(areaId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const updateArea = ({ areaId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${areaId}`, obj);
};

export const useUpdateArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateArea,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["area"] });
      queryClient.invalidateQueries({ queryKey: ["areaById"] });
    },
  });
};

const deleteArea = (areaId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${areaId}`);
};

export const useDeleteArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteArea,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["area"] });
    },
  });
};
