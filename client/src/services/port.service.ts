import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponse, GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IUser } from "./user.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/port`;

export interface IPort {
  _id: string;
  name: string;
  address: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
}

type PartialPort = Partial<IPort>;

const addPort = (port: PartialPort) => {
  return axios.post(`${baseUrl}/`, port);
};

export const useAddPort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPort,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["port"] });
    },
  });
};

const getPort = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IPort>>(`${baseUrl}/?${query}`);
};

export const usePort = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["port", pagination, searchObj],
    queryFn: () => getPort(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getPortById = (portId: string) => {
  return axios.get<GeneralApiResponse<IPort>>(`${baseUrl}/getById/${portId}`);
};

export const usePortById = (portId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["portById", portId],
    queryFn: () => getPortById(portId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpatePort = ({ portId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${portId}`, obj);
};

export const useUpdatePort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpatePort,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["port"] });
      queryClient.invalidateQueries({ queryKey: ["portById"] });
    },
  });
};

const deletePort = (portId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${portId}`);
};

export const useDeletePort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePort,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["port"] });
      // toastSuccess(res);
    },
  });
};
