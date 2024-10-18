import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponse, GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IUser } from "./user.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/attributeValue`;

export interface IAttributeValue {
  _id: string;
  name: string;
  attributeId: string;
  attributeName: string;
  isDeleted: boolean;
  deletedOn: Date;
}

type PartialAttributeValue = Partial<IAttributeValue>;

const addAttributeValue = (attributeValue: PartialAttributeValue) => {
  return axios.post(`${baseUrl}/`, attributeValue);
};

export const useAddAttributeValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAttributeValue,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["attributeValue"] });
    },
  });
};

const getAttributeValue = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IAttributeValue>>(`${baseUrl}/?${query}`);
};

export const useAttributeValue = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["attributeValue", pagination, searchObj],
    queryFn: () => getAttributeValue(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getAttributeValueById = (attributeValueId: string) => {
  return axios.get<GeneralApiResponse<IAttributeValue>>(`${baseUrl}/getById/${attributeValueId}`);
};

export const useAttributeValueById = (attributeValueId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["attributeValueById", attributeValueId],
    queryFn: () => getAttributeValueById(attributeValueId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateAttributeValue = ({ attributeValueId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${attributeValueId}`, obj);
};

export const useUpdateAttributeValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateAttributeValue,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["attributeValue"] });
      queryClient.invalidateQueries({ queryKey: ["attributeValueById"] });
    },
  });
};

const deleteAttributeValue = (attributeValueId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${attributeValueId}`);
};

export const useDeleteAttributeValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttributeValue,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["attributeValue"] });
      // toastSuccess(res);
    },
  });
};
