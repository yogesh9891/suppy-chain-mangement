import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";

const baseUrl = `${url}/v1/payment`;

export interface IPayments {
  _id: string;
  userId: string;
  storeId: string;
  createdBy: string;
  amount: number;
  description: string;
  isDeleted: boolean;
  deletedOn: Date;
  customer?: {
    name: string;
  };
  store?: {
    name: string;
  };
  createdUser?: {
    name: string;
  };
}



type PartialPayment = Partial<IPayments>;

const addPayment = (payment: PartialPayment) => {
  return axios.post(`${baseUrl}`, payment);
};

export const useAddPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPayment,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["payment"] });
      // toastSuccess(res);
    },
  });
};

const getPayment = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IPayments>>(`${baseUrl}?${query}`);
};

export const usePayment = (searchObj: Record<string, any> = {}, getPaginationFromParams = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["payment", pagination, searchObj],
    queryFn: () => getPayment(pagination, searchObj).then((res) => res.data),
  });
};

const getPaymentById = (paymentId: string) => {
  return axios.get<GeneralApiResponse<IPayments>>(`${baseUrl}/getById/${paymentId}`);
};

export const getLatesPaymentInSeries = () => {
  return axios.get(`${baseUrl}/getLatesPaymentInSeries`);
};

export const usePaymentById = (paymentId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["paymentById", paymentId],
    queryFn: () => getPaymentById(paymentId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

export const useLatesPaymentInSeries = (enabled: boolean) => {
  return useQuery({
    queryKey: ["latesPayment"],
    queryFn: () => getLatesPaymentInSeries().then((res) => res.data),
    enabled: enabled,
  });
};

const udpatePayment = ({ paymentId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${paymentId}`, obj);
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpatePayment,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["payment"] });
      queryClient.invalidateQueries({ queryKey: ["paymentById"] });
    },
  });
};

const deletePayment = (paymentId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${paymentId}`);
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePayment,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["payment"] });
      // toastSuccess(res);
    },
  });
};



