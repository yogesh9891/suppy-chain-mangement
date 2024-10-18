import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponse, GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";

const baseUrl = `${url}/v1/category`;

export interface ICategory {
  _id: string;
  name: string;
  thumbnail: string;
  parentCategoryId: string;
  parentCategory: ICategory;
  parentCategoryArr: [
    {
      _id?: string;
      categoryId: string | string;
    },
  ];
  isDeleted: boolean;
  deletedOn: Date;
}

type PartialCategory = Partial<ICategory>;

const addCategory = (category: PartialCategory) => {
  return axios.post(`${baseUrl}`, category);
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
  });
};

const getCategory = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<ICategory>>(`${baseUrl}/?${query}`);
};

export const useCategory = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["category", pagination, searchObj],
    queryFn: () => getCategory(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getCategoryById = (categoryId: string) => {
  return axios.get<GeneralApiResponse<ICategory>>(`${baseUrl}/getById/${categoryId}`);
};
const getNestedCategory = () => {
  return axios.get(`${baseUrl}/getNestedCategory`);
};

export const useNestedCategory = () => {
  return useQuery({
    queryKey: ["getNestedCategory"],
    queryFn: () => getNestedCategory().then((res) => res.data?.data),
  });
};

export const useCategoryById = (categoryId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["categoryById", categoryId],
    queryFn: () => getCategoryById(categoryId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateCategory = ({ categoryId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${categoryId}`, obj);
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
      queryClient.invalidateQueries({ queryKey: ["categoryById"] });
    },
  });
};

const deleteCategory = (categoryId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${categoryId}`);
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
      // toastSuccess(res);
    },
  });
};
