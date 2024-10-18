import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";

const baseUrl = `${url}/v1/carton`;

export interface ICartons {
  _id: string;
  name: string;
  weight: number;
  noOfItems: number;
  itemWeight: number;
  barCode: string;
  isDeleted: boolean;
  deletedOn: Date;
}

type PartialCarton = Partial<ICartons>;

const addCarton = (carton: PartialCarton) => {
  return axios.post(`${baseUrl}`, carton);
};

export const useAddCarton = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCarton,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["carton"] });
      // toastSuccess(res);
    },
  });
};

const getCarton = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<ICartons>>(`${baseUrl}?${query}`);
};

export const useCarton = (searchObj: Record<string, any> = {}, getPaginationFromParams = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["carton", pagination, searchObj],
    queryFn: () => getCarton(pagination, searchObj).then((res) => res.data),
  });
};

const getCartonById = (cartonId: string) => {
  return axios.get<GeneralApiResponse<ICartons>>(`${baseUrl}/getById/${cartonId}`);
};

export const useCartonById = (cartonId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["cartonById", cartonId],
    queryFn: () => getCartonById(cartonId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateCarton = ({ cartonId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${cartonId}`, obj);
};

export const useUpdateCarton = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateCarton,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["carton"] });
      queryClient.invalidateQueries({ queryKey: ["cartonById"] });
    },
  });
};

const deleteCarton = (cartonId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${cartonId}`);
};

export const useDeleteCarton = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCarton,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["carton"] });
      // toastSuccess(res);
    },
  });
};
