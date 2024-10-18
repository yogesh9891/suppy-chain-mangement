import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";

const baseUrl = `${url}/v1/zone`;

export interface ICountries {
  _id: string;
  name: string;
  createdAt: Date;
  updateAt: Date;
}

type PartialZone = Partial<ICountries>;

const addZone = (zone: PartialZone) => {
  return axios.post(`${baseUrl}`, zone);
};

export const useAddZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addZone,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["zone"] });
      // toastSuccess(res);
    },
  });
};

const getZone = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<ICountries>>(`${baseUrl}?${query}`);
};

export const useZone = (searchObj: Record<string, any> = {}, getPaginationFromParams = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["zone", pagination, searchObj],
    queryFn: () => getZone(pagination, searchObj).then((res) => res.data),
  });
};

const getZoneById = (zoneId: string) => {
  return axios.get<GeneralApiResponse<ICountries>>(`${baseUrl}/getById/${zoneId}`);
};

export const useZoneById = (zoneId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["zoneById", zoneId],
    queryFn: () => getZoneById(zoneId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateZone = ({ zoneId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${zoneId}`, obj);
};

export const useUpdateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateZone,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["zone"] });
      queryClient.invalidateQueries({ queryKey: ["zoneById"] });
    },
  });
};

const deleteZone = (zoneId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${zoneId}`);
};

export const useDeleteZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteZone,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["zone"] });
      // toastSuccess(res);
    },
  });
};
