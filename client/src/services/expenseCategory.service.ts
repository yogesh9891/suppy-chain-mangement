import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponse, GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IUser } from "./user.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/expenseCategory`;

export interface IExpenseCategory {
  _id: string;
  name: string;
  isDeleted: boolean;
  deletedOn: Date;
}

type PartialExpenseCategory = Partial<IExpenseCategory>;

const addExpenseCategory = (expenseCategory: PartialExpenseCategory) => {
  return axios.post(`${baseUrl}/`, expenseCategory);
};

export const useAddExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExpenseCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategory"] });
    },
  });
};

const getExpenseCategory = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IExpenseCategory>>(`${baseUrl}/?${query}`);
};

export const useExpenseCategory = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["expenseCategory", pagination, searchObj],
    queryFn: () => getExpenseCategory(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getExpenseCategoryById = (expenseCategoryId: string) => {
  return axios.get<GeneralApiResponse<IExpenseCategory>>(`${baseUrl}/getById/${expenseCategoryId}`);
};

export const useExpenseCategoryById = (expenseCategoryId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["expenseCategoryById", expenseCategoryId],
    queryFn: () => getExpenseCategoryById(expenseCategoryId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateExpenseCategory = ({ expenseCategoryId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${expenseCategoryId}`, obj);
};

export const useUpdateExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateExpenseCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategory"] });
      queryClient.invalidateQueries({ queryKey: ["expenseCategoryById"] });
    },
  });
};

const deleteExpenseCategory = (expenseCategoryId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${expenseCategoryId}`);
};

export const useDeleteExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpenseCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategory"] });
      // toastSuccess(res);
    },
  });
};
