import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";

const baseUrl = `${url}/v1/country`;

export interface ICountries {
  _id: string;
  name: string;
  createdAt: Date;
  updateAt: Date;
}

type PartialCountry = Partial<ICountries>;

const addCountry = (country: PartialCountry) => {
  return axios.post(`${baseUrl}`, country);
};

export const useAddCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCountry,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["country"] });
      // toastSuccess(res);
    },
  });
};

const getCountry = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<ICountries>>(`${baseUrl}?${query}`);
};

export const useCountry = (searchObj: Record<string, any> = {}, getPaginationFromParams = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["country", pagination, searchObj],
    queryFn: () => getCountry(pagination, searchObj).then((res) => res.data),
  });
};

const getCountryById = (countryId: string) => {
  return axios.get<GeneralApiResponse<ICountries>>(`${baseUrl}/getById/${countryId}`);
};

export const useCountryById = (countryId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["countryById", countryId],
    queryFn: () => getCountryById(countryId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateCountry = ({ countryId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${countryId}`, obj);
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateCountry,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["country"] });
      queryClient.invalidateQueries({ queryKey: ["countryById"] });
    },
  });
};

const deleteCountry = (countryId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${countryId}`);
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCountry,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["country"] });
      // toastSuccess(res);
    },
  });
};
