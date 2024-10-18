import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IBrand } from "./brand.service";
import { ICategory } from "./category.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";
import { IProduct, IProductSingle } from "./product.service";

const baseUrl = `${url}/v1/productStock`;




export interface IProductStock {
  _id: string;
  productArr?: IProductSingle[];
  productId: string;
  productStockId: string;
  name: string;
  msp: string;
  gst: number;
  tax: number;
  box: number;
  packet: number;
  price: number;
  sellingPrice: number;
  quantity: number;
  barCode: string;
  totalItemInCarton: number;
  noOfItemInBox: number;
  noOfItemInCarton: number;
  totalItems: number;
  leftItems: number;
  orderedToId: string;
  type: string;
  batchId: string;
  isSold: boolean;
  createdAt: Date;
  updateAt: Date;
}
export type PartialProductStock = Partial<IProductStock>;

const addProductOrder = (productStock: PartialProductStock) => {
  return axios.post(`${baseUrl}`, productStock);
};


export const getStockProduct = (query: any) => {
  return axios.get(`${baseUrl}?${query}`);
};
export const useAddProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProductOrder,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["productStock"] });
    },
  });
};


const getProductOrder = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IProductStock>>(`${baseUrl}?${query}`);
};

export const useProductStock = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["productStock", pagination, searchObj],
    queryFn: () => getProductOrder(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};



const udpateProductStock = ({ productStockId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateById/${productStockId}`, obj);
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: udpateProductStock,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["productStock"] });
      queryClient.invalidateQueries({ queryKey: ["productStockById"] });
    },
  });
};


const deleteStock= (stockId: string) => {
  return axios.delete(`${baseUrl}/deleteById/${stockId}`);
};

export const useDeleteStock= () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStock,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      // toastSuccess(res);
    },
  });
};
