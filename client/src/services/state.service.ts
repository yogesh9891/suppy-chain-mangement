import { toastError, toastSuccess } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";

const baseUrl = `${url}/v1/state`;

export interface IState {
  _id: string;
  name: string;
  countryId: string;
  countryName: string;
  createdAt: Date;
  updateAt: Date;
}

type PartialState = Partial<IState>;

const addState = (state: PartialState) => {
  return axios.post(`${baseUrl}`, state);
};

export const useAddState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addState,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["state"] });
      // toastSuccess(res);
    },
  });
};

const getState = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IState>>(`${baseUrl}?${query}`);
};

export const useStates = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["state", pagination, searchObj],
    queryFn: () => getState(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getStateById = (stateId: string) => {
  return axios.get<GeneralApiResponse<IState>>(`${baseUrl}/getById/${stateId}`);
};

export const useStateById = (stateId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["stateById", stateId],
    queryFn: () => getStateById(stateId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateState = ({ stateId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${stateId}`, obj);
};

export const useUpdateState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateState,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["state"] });
      queryClient.invalidateQueries({ queryKey: ["stateById"] });
    },
  });
};

const deleteState = (stateId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${stateId}`);
};

export const useDeleteState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteState,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["state"] });
    },
  });
};
