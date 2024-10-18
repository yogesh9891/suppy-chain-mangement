import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";
import { ROLES_TYPE, TAG_TYPE } from "@/common/constant.common";
import { IUser } from "./user.service";
import { IBrand } from "./brand.service";

const baseUrl = `${url}/v1/brandTag`;

export interface IBrandTag {
  _id: string;
  typeOfTagging: TAG_TYPE; // primary | secondary
  fromUserId: string;
  brandId: string;
  brandObj: IBrand;
  fromUserRole: ROLES_TYPE;
  fromUserObj?: IUser;
  toUserId: string;
  toUserRole: ROLES_TYPE;
  toUserObj?: IUser;
  throughUserId: string;
  throughUserRole: ROLES_TYPE;
  throughUserObj?: IUser;
  createdAt: Date;
  updatedAt: Date;
}

type PartialBrandTag = Partial<IBrandTag>;

const addBrandTag = (brandTag: { fromUserId: string; toUserId: string; brandId: string }) => {
  return axios.post(`${baseUrl}`, brandTag);
};
const deleteBrandTag = (id: string) => {
  return axios.delete(`${baseUrl}/deleteById/${id}`);
};

export const useDeleteBrandTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBrandTag,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["brand_with_tag"] });
      queryClient.invalidateQueries({ queryKey: ["brand_tag"] });
      queryClient.invalidateQueries({ queryKey: ["brand_tagged_users"] });
      // toastSuccess(res);
    },
  });
};

export const useAddBrandTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBrandTag,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["brand_with_tag"] });
      queryClient.invalidateQueries({ queryKey: ["brand_tag"] });
      queryClient.invalidateQueries({ queryKey: ["brand_tagged_users"] });
      // toastSuccess(res);
    },
  });
};

// TODO add search type
const getBrandTagByUser = (id: string, pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IBrandTag>>(`${baseUrl}/getForUser/${id}?${query}`);
};

export const useBrandTagByUser = (id: string, searchObj: Record<string, any> = {}, getPaginationFromParams = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["tag", id, pagination, searchObj],
    queryFn: () => getBrandTagByUser(id, pagination, searchObj).then((res) => res.data),
  });
};
