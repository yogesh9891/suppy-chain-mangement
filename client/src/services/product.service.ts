import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IBrand } from "./brand.service";
import { ICategory } from "./category.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/product`;

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  brandId: string;
  colorId: string;
  sizeId: string;
  categoryArr: { categoryId: string }[];
  skuCode: string;
  hsnCode: string;
  barCode: string;
  packet: number;
  box: number;
  totalItemInCarton: number;
  gst: number;
  msp: number;
  attributeArr: {
    price: number;
    name: string;
    attributeValueArr: { attributeValueId: string; attributeId: string }[];
  }[];
  thumbnail: string;
  imagesArr: { image: string; order: number }[];
  isDeleted: boolean;
  deletedOn: Date;
}

export interface IProductSingle {
  _id: string;
  gst: any;
  productId: string;
  price: number;
  msp: number;
  barCode: string;
  packet: number;
  box: number;
  totalItemInCarton: number;
  quantity: number;
  name: string;
}
export type PartialProduct = Partial<IProduct>;

const addProduct = (product: PartialProduct) => {
  return axios.post(`${baseUrl}`, product);
};

export const useAddProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProduct,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};

const getProduct = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IProduct>>(`${baseUrl}?${query}`);
};
const getProductWithAttribute = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IProductSingle>>(`${baseUrl}/getProductWithAttribute?${query}`);
};

export const useProduct = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["product", pagination, searchObj],
    queryFn: () => getProduct(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
export const useGetProductWithAttribute = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["productAttribute", pagination, searchObj],
    queryFn: () => getProductWithAttribute(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getProductById = (productId: string) => {
  return axios.get<GeneralApiResponsePagination<IProduct>>(`${baseUrl}/getById/${productId}`);
};

export const useProductById = (productId: any, enabled = true) => {
  return useQuery({
    queryKey: ["productById", productId],
    queryFn: () => getProductById(productId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

/**
 * The user will receive the product if it is in stock or not.
 * if the product is in stock for the particular user, then the stockObj will be attached. Otherwise, there will not be a stock obj.
 * UserId mandatory.
 */
const getProductWithStock = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IProduct>>(`${baseUrl}/withStock?${query}`);
};

export const useProductsWithStock = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["productWithStock", pagination, searchObj],
    queryFn: () => getProductWithStock(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

/**
 * Only Products which are in stock for a specific user will get with attached stockObj.
 * UserId mandatory.
 */
const getProductInStock = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IProduct>>(`${baseUrl}/inStock?${query}`);
};

export const useProductsInStock = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
  pageIndexKey = pageIndex,
  pageSizeKey = pageSize,
) => {
  const pagination = usePagination(getPaginationFromParams, pageIndexKey, pageSizeKey);
  return useQuery({
    queryKey: ["productInStock", pagination, searchObj],
    queryFn: () => getProductInStock(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

/**
 * Update product isFocused
 */

const updateIsFocused = (product: any) => {
  return axios.patch(`${baseUrl}/updateIsFocusedById`, product);
};

export const useUpdateProductIsFocused = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIsFocused,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};

const updateProduct = ({ productId, ...product }: any) => {
  return axios.patch(`${baseUrl}/updateById/${productId}`, product);
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["productById"] });
    },
  });
};
