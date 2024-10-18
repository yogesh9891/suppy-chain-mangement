import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ICompany } from "./company.service";
import { IBrand } from "./brand.service";
import { ICategory } from "./category.service";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";
import { IProductStock } from "./order.service";

const baseUrl = `${url}/v1/companyOrder`;

export interface ICompanyOrder {
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
  totalStock: number;
  leftStock: number;
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

export interface ICompanyOrderLogs {
  _id: string;
  productId: string;
  brandId: string;
  colorId: string;
  sizeId: string;
  name: string;
  price: number;
  msp: number;
  gst: number;
  quantity: number;
  previousQuantity: number;
  currentQuantity: number;
  orderedFromId: string;
  orderedToId: string;
  batchId: string;
  status: string;
  type: string;
  createdAt: Date;
  updateAt: Date;
}
export type PartialCompanyOrder = Partial<ICompanyOrder>;

const addCompanyOrder = (companyOrder: PartialCompanyOrder) => {
  return axios.post(`${baseUrl}`, companyOrder);
};

const InhouseCompanyOrder = (companyOrder: PartialCompanyOrder) => {
  return axios.post(`${baseUrl}/inhouseCompanyOrder`, companyOrder);
};


export const useAddCompanyOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCompanyOrder,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["companyOrder"] });
    },
  });
};

export const useAddInHouseCompanyOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InhouseCompanyOrder,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["InhouseCompanyOrder"] });
    },
  });
};

const getCompanyOrder = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<ICompanyOrder>>(`${baseUrl}?${query}`);
};

export const useCompanyOrder = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["companyOrder", pagination, searchObj],
    queryFn: () => getCompanyOrder(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getProducOrdertById = (orderId: string) => {
  return axios.get<GeneralApiResponsePagination<ICompanyOrder>>(`${baseUrl}/getById/${orderId}`);
};

export const useCompanyOrderById = (orderId: any, enabled = true) => {
  return useQuery({
    queryKey: ["companyOrderById", orderId],
    queryFn: () => getProducOrdertById(orderId).then((res) => res.data?.data),
    enabled: enabled,
  });
};

const updateCompanyOrder = ({ batchId, ...product }: any) => {
  return axios.patch(`${baseUrl}/updateById/${batchId}`, product);
};

export const useUpdateCompanyOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanyOrder,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["companyOrder"] });
      queryClient.invalidateQueries({ queryKey: ["companyOrderById"] });
    },
  });
};
const addProductCompanyOrder = ({ companyId, ...product }: any) => {
  return axios.patch(`${baseUrl}/addProductCompanyOrder/${companyId}`, product);
};

export const useAddProductCompanyOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProductCompanyOrder,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["companyOrder"] });
      queryClient.invalidateQueries({ queryKey: ["companyOrderById"] });
    },
  });
};

const updateCompanyStatus = ({ id, ...product }: any) => {
  return axios.patch(`${baseUrl}/updateStatus/${id}`, product);
};

export const useUpdateCompanyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanyStatus,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["companyOrderStatus"] });
      queryClient.invalidateQueries({ queryKey: ["companyOrderStatusById"] });
    },
  });
};



const getProductOrder = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IProductStock>>(`${baseUrl}/getProductStock?${query}`);
};

export const useCompanyProductStock = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["getProductOrder", pagination, searchObj],
    queryFn: () => getProductOrder(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
const getStockByProductId = (orderId: string) => {
  return axios.get<GeneralApiResponsePagination<ICompanyOrderLogs>>(`${baseUrl}/getStockByProductId/${orderId}`);
};

export const useGetStockByProductId = (orderId: any, enabled = true) => {
  return useQuery({
    queryKey: ["getStockByProductId", orderId],
    queryFn: () => getStockByProductId(orderId).then((res) => res.data?.data),
    enabled: enabled,
  });
};




const getOrderBYProductId = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IProductStock>>(
    `${baseUrl}/getOrderByProductId/${searchObj.productId}`,
  );
};

export const useOrderStockByProductId = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["getOrderBYProductId", pagination, searchObj],
    queryFn: () => getOrderBYProductId(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};