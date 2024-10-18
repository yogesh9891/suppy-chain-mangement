import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IBrand } from "./brand.service";
import { ICategory } from "./category.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/productOrder`;

export interface IProductOrder {
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
  subTotal: number;
  discountValue: number;
  orderedToId: string;
  total: number;
  orderStatus: {
    currentStatus: string;
    on: Date;
  };
  statusArr: {
    status: String;
    on: Date;
  }[];
  reason: string;
  name: string;
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
  gst: number;
  tax: number;
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
export type PartialProductOrder = Partial<IProductOrder>;

const addProductOrder = (productOrder: PartialProductOrder) => {
  return axios.post(`${baseUrl}`, productOrder);
};

const InhouseProductOrder = (productOrder: PartialProductOrder) => {
  return axios.post(`${baseUrl}/inhouseProductOrder`, productOrder);
};


export const useAddProductOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProductOrder,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["productOrder"] });
    },
  });
};

export const useAddInHouseProductOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InhouseProductOrder,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["InhouseProductOrder"] });
    },
  });
};

const getProductOrder = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IProductOrder>>(`${baseUrl}?${query}`);
};

export const useProductOrder = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["productOrder", pagination, searchObj],
    queryFn: () => getProductOrder(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getProducOrdertById = (orderId: string) => {
  return axios.get<GeneralApiResponsePagination<IProductOrder>>(`${baseUrl}/getById/${orderId}`);
};

export const useProductOrderById = (orderId: any, enabled = true) => {
  return useQuery({
    queryKey: ["productOrderById", orderId],
    queryFn: () => getProducOrdertById(orderId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const updateProductOrder = ({ productId, ...product }: any) => {
  return axios.patch(`${baseUrl}/updateById/${productId}`, product);
};

export const useUpdateProductOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductOrder,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["productOrder"] });
      queryClient.invalidateQueries({ queryKey: ["productOrderById"] });
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
