import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IBrand } from "./brand.service";
import { ICategory } from "./category.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/order`;

export interface IOrder {
  _id: string;
  productsArr: {
    productId: string;
    attributeArr: {
      price: number;
      weight: number;
      name: string;
      attributeValueArr: { attributeValueId: string; attributeId: string }[];
    };
    name: string;
    price: number;
    gst: number;
    tax: number;
    msp: number;
    quantity: number;
    subTotal: number;
    totalWeight: number;
  }[];
  sellerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    state: string;
    city: string;
    postalCode: string;
  };
  createdBy: {
    userId: string;
    name: string;
  };
  subTotal: Number;
  totalTax: Number;
  discountValue: Number;
  orderedToId: string;
  orderedFromId: string;
  total: Number;

  orderStatus: {
    currentStatus: string;
    on: Date;
  };
  statusArr: {
    status: String;
    on: Date;
  }[];
  reason: string;
  createdAt: Date;
  updateAt: Date;
}

export interface IProductStock {
  _id: string;
  productId: string;
  attributeArr: {
    price: number;
    name: string;
    attributeValueArr: { attributeValueId: string; attributeId: string }[];
  };
  name: string;
  msp: string;
  price: number;
  sellingPrice?: number;
  quantity: number;
  barCode: string;
  totalItemInCarton: number;
  totalQuantity: number;
  totalTransitItems: number;
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
export type PartialOrder = Partial<IOrder>;

const addOrder = (order: PartialOrder) => {
  return axios.post(`${baseUrl}`, order);
};

export const useAddOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addOrder,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
};

const getOrder = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IOrder>>(`${baseUrl}?${query}`);
};

export const useOrder = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["order", pagination, searchObj],
    queryFn: () => getOrder(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

export const getProducOrdertById = (orderId: string) => {
  return axios.get<GeneralApiResponsePagination<IOrder>>(`${baseUrl}/getById/${orderId}`);
};

export const useOrderById = (orderId: any, enabled = true) => {
  return useQuery({
    queryKey: ["orderById", orderId],
    queryFn: () => getProducOrdertById(orderId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const updateOrder = ({ productId, ...product }: any) => {
  return axios.patch(`${baseUrl}/updateById/${productId}`, product);
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrder,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["orderById"] });
    },
  });
};

const getProductStock = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IProductStock>>(`${baseUrl}/getProductStock?${query}`);
};

export const useProductStock = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["productStock", pagination, searchObj],
    queryFn: () => getProductStock(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
