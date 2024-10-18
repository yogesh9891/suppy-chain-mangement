import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { IProductStock } from "./order.service";

const baseUrl = `${url}/v1/container`;

export interface IContainer {
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
  portId: string;
  portName: string;
  subTotal: number;
  stock: number;
  discountValue: number;
  orderedToId: string;
  name: string;
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
  createdAt: Date;
  updateAt: Date;
}

export interface IWareHouse {
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
  orderedFromId: string;
  orderedToId: string;
  status: string;
  type: string;
  createdAt: Date;
  updateAt: Date;
}


export interface IWareHouseLogs {
  _id: string;
  productId: string;
  name: string;
  price: number;
  msp: number;
  gst: number;
  quantity: number;
  previousQuantity: number;
  currentQuantity: number;
  leftQuantity: number;
  orderedFromId: string;
  orderedToId: string;
  batchId: string;
  status: string;
  type: string;
  createdAt: Date;
  updateAt: Date;
}
export type PartialContainer = Partial<IContainer>;

const addContainer = (container: PartialContainer) => {
  return axios.post(`${baseUrl}`, container);
};


export const useAddContainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addContainer,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["container"] });
    },
  });
};
const addWarehouse= (warehouse: PartialContainer) => {
  return axios.post(`${baseUrl}/warehouse`, warehouse);
};


export const useAddWarehouse= () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addWarehouse,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["container"] });
    },
  });
};



const getWareHouse = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IWareHouse>>(`${baseUrl}/getWareHouseStock?${query}`);
};

export const useWareHouse = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["warehouse", pagination, searchObj],
    queryFn: () => getWareHouse(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
const getContainer = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IContainer>>(`${baseUrl}?${query}`);
};

export const useContainer = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["container", pagination, searchObj],
    queryFn: () => getContainer(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getProducOrdertById = (orderId: string) => {
  return axios.get<GeneralApiResponsePagination<IContainer>>(`${baseUrl}/getById/${orderId}`);
};

export const useContainerById = (orderId: any, enabled = true) => {
  return useQuery({
    queryKey: ["containerById", orderId],
    queryFn: () => getProducOrdertById(orderId).then((res) => res.data?.data),
    enabled: enabled,
  });
};


const getWareHouseStocklogs = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IWareHouse>>(`${baseUrl}/getWareHouseStocklogs?${query}`);
};

export const useWareHouseStockLogs = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["container", pagination, searchObj],
    queryFn: () => getWareHouseStocklogs(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const updateContainer = ({ batchId, ...product }: any) => {
  return axios.patch(`${baseUrl}/updateById/${batchId}`, product);
};

export const useUpdateContainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContainer,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["container"] });
      queryClient.invalidateQueries({ queryKey: ["containerById"] });
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
      queryClient.invalidateQueries({ queryKey: ["containerStatus"] });
      queryClient.invalidateQueries({ queryKey: ["containerStatusById"] });
    },
  });
};



