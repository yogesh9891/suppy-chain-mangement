import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";

const baseUrl = `${url}/v1/barcode`;

export interface IBarCodes {
  _id: string;
  productId: string;
  barCodeType: string;
  name: string;
  barCode: string;
  isDeleted: boolean;
  deletedOn: Date;
}

export interface IBarCodesStock {
  price: number;
  quantity: number;
  sellingPrice: number;
  orderedToId: number;
  msp: number;
  gst: number;
  packet: number;
  box: number;
  barCode: string;
  barCodeId: string;
  barCodeType: string;
  name: string;
  productId: string;
  totalItems: number;
  leftItems: number;
}

type PartialBarCode = Partial<IBarCodes>;

const addBarCode = (barcode: PartialBarCode) => {
  return axios.post(`${baseUrl}`, barcode);
};

export const useAddBarCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBarCode,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["barcode"] });
      // toastSuccess(res);
    },
  });
};

const getBarCode = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IBarCodes>>(`${baseUrl}?${query}`);
};

export const useBarCode = (searchObj: Record<string, any> = {}, getPaginationFromParams = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["barcode", pagination, searchObj],
    queryFn: () => getBarCode(pagination, searchObj).then((res) => res.data),
  });
};

const getBarCodeById = (barcodeId: string) => {
  return axios.get<GeneralApiResponse<IBarCodes>>(`${baseUrl}/getById/${barcodeId}`);
};

export const getLatesBarCodeInSeries = () => {
  return axios.get(`${baseUrl}/getLatesBarCodeInSeries`);
};

export const useBarCodeById = (barcodeId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["barcodeById", barcodeId],
    queryFn: () => getBarCodeById(barcodeId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

export const useLatesBarCodeInSeries = (enabled: boolean) => {
  return useQuery({
    queryKey: ["latesBarCode"],
    queryFn: () => getLatesBarCodeInSeries().then((res) => res.data),
    enabled: enabled,
  });
};

const udpateBarCode = ({ barcodeId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${barcodeId}`, obj);
};

export const useUpdateBarCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateBarCode,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["barcode"] });
      queryClient.invalidateQueries({ queryKey: ["barcodeById"] });
    },
  });
};

const deleteBarCode = (barcodeId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${barcodeId}`);
};

export const useDeleteBarCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBarCode,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["barcode"] });
      // toastSuccess(res);
    },
  });
};

export  const getBarCodeWithProduct = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IBarCodesStock>>(`${baseUrl}/getBarCodeWithProduct?${query}`);
};

export const useBarCodeWithProduct = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["barCodeWithProduct", pagination, searchObj],
    queryFn: () => getBarCodeWithProduct(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
