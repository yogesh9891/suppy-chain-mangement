import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";

const baseUrl = `${url}/v1/expense`;

export interface IExpenses {
  _id: string;
  userId: string;
  expenseCategoryId: string;
  expenseCategoryName: string;
  description: string;
  amount: number;
  isDeleted: boolean;
  deletedOn: Date;
}

type PartialExpense = Partial<IExpenses>;

const addExpense = (expense: PartialExpense) => {
  return axios.post(`${baseUrl}`, expense);
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExpense,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["expense"] });
      // toastSuccess(res);
    },
  });
};

const getExpense = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IExpenses>>(`${baseUrl}?${query}`);
};

export const useExpense = (searchObj: Record<string, any> = {}, getPaginationFromParams = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["expense", pagination, searchObj],
    queryFn: () => getExpense(pagination, searchObj).then((res) => res.data),
  });
};

const getExpenseById = (expenseId: string) => {
  return axios.get<GeneralApiResponse<IExpenses>>(`${baseUrl}/getById/${expenseId}`);
};

export const useExpenseById = (expenseId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["expenseById", expenseId],
    queryFn: () => getExpenseById(expenseId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const udpateExpense = ({ expenseId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${expenseId}`, obj);
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateExpense,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["expense"] });
      queryClient.invalidateQueries({ queryKey: ["expenseById"] });
    },
  });
};

const deleteExpense = (expenseId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${expenseId}`);
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["expense"] });
      // toastSuccess(res);
    },
  });
};
