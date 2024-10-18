import { userTargetPageIndex, userTargetPageSkip } from "@/common/constant_frontend.common";
import { usePagination } from "@/hooks/usePagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import axios from "./axios.service";
import { GeneralApiResponsePagination, url } from "./url.service";

const baseUrl = `${url}/v1/target`;

export interface IUserTarget {
  _id: string;
  userId: string;
  from: Date;
  to: Date;
  target: number;
  status: string;
  createdAt: Date;
  updateAt: Date;
}

type PartialUserTarget = Partial<IUserTarget>;

const addUserTarget = (beat: PartialUserTarget) => {
  return axios.post(`${baseUrl}`, beat);
};

export const useAddUserTarget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addUserTarget,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["user_target"] });
      queryClient.invalidateQueries({ queryKey: ["user_team_target"] });
    },
  });
};

const getUserTargetByUserId = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IUserTarget>>(`${baseUrl}?${query}`);
};

export const useUserTarget = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams, userTargetPageIndex, userTargetPageSkip);
  return useQuery({
    queryKey: ["user_target", pagination, searchObj],
    queryFn: () => getUserTargetByUserId(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};

const getUserTeamTargetByUserId = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IUserTarget>>(`${baseUrl}/teamtarget?${query}`);
};

export const useUserTeamTarget = (
  searchObj: Record<string, any> = {},
  getPaginationFromParams = true,
  enabled = true,
) => {
  const pagination = usePagination(getPaginationFromParams, userTargetPageIndex, userTargetPageSkip);
  return useQuery({
    queryKey: ["user_team_target", pagination, searchObj],
    queryFn: () => getUserTeamTargetByUserId(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
