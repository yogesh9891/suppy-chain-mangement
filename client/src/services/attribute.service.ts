import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponse, GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IUser } from "./user.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/attribute`;

export interface IAttribute {
  _id: string;
  name: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: Date;
}

type PartialAttribute = Partial<IAttribute>;

const addAttribute = (attribute: PartialAttribute) => {
  return axios.post(`${baseUrl}/`, attribute);
};

export const useAddAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAttribute,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["attribute"] });
    },
  });
};

const getAttribute = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IAttribute>>(`${baseUrl}/?${query}`);
};

export const useAttribute = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["attribute", pagination, searchObj],
    queryFn: () => getAttribute(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getAttributeById = (attributeId: string) => {
  return axios.get<GeneralApiResponse<IAttribute>>(`${baseUrl}/getById/${attributeId}`);
};

export const useAttributeById = (attributeId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["attributeById", attributeId],
    queryFn: () => getAttributeById(attributeId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateAttribute = ({ attributeId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${attributeId}`, obj);
};

export const useUpdateAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateAttribute,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["attribute"] });
      queryClient.invalidateQueries({ queryKey: ["attributeById"] });
    },
  });
};

const deleteAttribute = (attributeId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${attributeId}`);
};

export const useDeleteAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttribute,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["attribute"] });
      // toastSuccess(res);
    },
  });
};

const getAttributeWithValue = () => {
  return axios.get<GeneralApiResponse<IAttribute>>(`${baseUrl}/getAttributeWithValue`);
};

export const useGetAttributeWithValue = () => {
  return useQuery({
    queryKey: ["getAttributeWithValue"],
    queryFn: () => getAttributeWithValue().then((res) => res.data?.data),
  });
};
