import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";

const baseUrl = `${url}/v1/city`;

export interface ICity {
  _id: string;
  name: string;
  countryId: string;
  countryName: string;
  stateId: string;
  stateName: string;
  createdAt: Date;
  updateAt: Date;
}

type PartialCity = Partial<ICity>;

const addCity = (city: PartialCity) => {
  return axios.post(`${baseUrl}`, city);
};

export const useAddCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCity,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["city"] });
    },
  });
};

const getCity = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<ICity>>(`${baseUrl}?${query}`);
};

export const useCity = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["city", pagination, searchObj],
    queryFn: () => getCity(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getCityById = (cityId: string) => {
  return axios.get<GeneralApiResponse<ICity>>(`${baseUrl}/getById/${cityId}`);
};

export const useCityById = (cityId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["cityById", cityId],
    queryFn: () => getCityById(cityId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateCity = ({ cityId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${cityId}`, obj);
};

export const useUpdateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateCity,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["city"] });
      queryClient.invalidateQueries({ queryKey: ["cityById"] });
    },
  });
};

const deleteCity = (cityId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${cityId}`);
};

export const useDeleteCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCity,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["city"] });
    },
  });
};
