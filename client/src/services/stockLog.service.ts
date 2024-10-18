import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponsePagination } from "./url.service";
import { ROLES_TYPE } from "@/common/constant.common";
import { PaginationState } from "@tanstack/react-table";
import { IProduct } from "./product.service";
import { usePagination } from "@/hooks/usePagination";

const baseUrl = `${url}/v1/stockLog`;

export interface IStockLog extends Document {
  userId: string;
  userRole: string;
  skuCode: string;
  stockUpdateMessage: string;
  stockUpdateVal: number;
  stockUpdateType: string;
  prevVal: number;
  newValue: number;
  pts: number;
  ptd: number;
  ptc: number;
  ptr: number;
  mrp: number;
  isDeleted: boolean;
  deletedAt: Date;
  deletedById: string;
  deletedByRole: ROLES_TYPE;
  updatedById: string;
  updatedByRole: ROLES_TYPE;
  createdById: string;
  createdByRole: string;
  createdAt: Date;
  updatedAt: Date;
  _id: string;
}

export type PartialStockLog = Partial<IStockLog>;

const getStockLog = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IProduct>>(`${baseUrl}/?${query}`);
};

export const useStockLog = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["stockLog", pagination, searchObj],
    queryFn: () => getStockLog(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
