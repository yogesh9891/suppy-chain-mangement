import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponsePagination, url } from "./url.service";
import { usePagination } from "@/hooks/usePagination";
import { PaginationState } from "@tanstack/react-table";
import { ROLES_TYPE, TAG_TYPE } from "@/common/constant.common";
import { IUser } from "./user.service";

const baseUrl = `${url}/v1/tag`;

export interface ITag {
  _id: string;
  typeOfTagging: TAG_TYPE; // primary | secondary
  fromUserId: string;
  fromUserRole: ROLES_TYPE;
  fromUserObj?: IUser;
  toUserId: string;
  toUserRole: ROLES_TYPE;
  toUserObj?: IUser;
  throughUserId: string;
  throughUserRole: ROLES_TYPE;
  throughUserObj?: IUser;
}

type PartialTag = Partial<ITag>;

const addTag = (tag: { fromUserId: string; toUserId: string }) => {
  return axios.post(`${baseUrl}`, tag);
};
const deleteTag = (id: string) => {
  return axios.delete(`${baseUrl}/deleteById/${id}`);
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tag"] });
      queryClient.invalidateQueries({ queryKey: ["tagged_users"] });
      // toastSuccess(res);
    },
  });
};

export const useAddTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTag,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tag"] });
      queryClient.invalidateQueries({ queryKey: ["tagged_users"] });
      // toastSuccess(res);
    },
  });
};

// TODO add search type
const getTagByUser = (id: string, pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<ITag>>(`${baseUrl}/getForUser/${id}?${query}`);
};

export const useTagByUser = (id: string, searchObj: Record<string, any> = {}, getPaginationFromParams = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["tag", id, pagination, searchObj],
    queryFn: () => getTagByUser(id, pagination, searchObj).then((res) => res.data),
  });
};
