import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { axiosAuth } from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ROLES, ROLES_TYPE } from "@/common/constant.common";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/user`;

type webloginResponse = {
  message: string;
  token: string;
  id: string;
  name: string;
  role: string;
};
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  countryId: string;
  countryName: string;
  stateId: string;
  stateName: string;
  cityId: string;
  cityName: string;
  areaId: string;
  zoneId: string;
  zoneName: string;
  storeId: string;
  areaName: string;
  storeName: string;
  address: string;
  pincode: string;
  isVerified: boolean;
  status: string;
  profileImage: string;
  role: ROLES_TYPE;
  isDeleted: boolean;
  deletedOn: Date;
  createdAt: Date;
  updateAt: Date;
}

export type PartialUser = Partial<IUser>;

export const webLogin = (formobj: { email: string; password: string }) => {
  return axios.post<webloginResponse>(`${baseUrl}/login`, formobj);
};

const getProfile = () => {
  return axiosAuth.get<GeneralApiResponse<IUser>>(`${baseUrl}/getProfile`);
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile().then((res) => res.data.data),
  });
};

const addUser = (user: PartialUser) => {
  return axios.post(`${baseUrl}/`, user);
};

export const useAddUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUser,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // toastSuccess(res);
    },
  });
};

const updateUser = ({ userId, ...user }: any) => {
  return axios.patch(`${baseUrl}/updateByAdmin/${userId}`, user);
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userObj"] });
    },
  });
};

const updateProfileImage = ({ userId, ...user }: any) => {
  return axios.patch(`${baseUrl}/updateProfileImage/${userId}`, user);
};

export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileImage,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userObj"] });
    },
  });
};

const updatePassword = ({ userId, ...user }: any) => {
  return axios.patch(`${baseUrl}/updatePasswordByAdmin/${userId}`, user);
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePassword,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userObj"] });
    },
  });
};

const updateUserTargetPC = ({ userId, ...obj }: any) => {
  return axios.patch(`${baseUrl}/updateUserTargetPC/${userId}`, obj);
};

export const useUpdateUserTargetPC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserTargetPC,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userObj"] });
    },
  });
};

const getUser = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IUser>>(`${baseUrl}/?${query}`);
};

export const useUser = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["user", pagination, searchObj],
    queryFn: () => getUser(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
    // refetchOnMount: false,
  });
};

const getUserById = (_id: string) => {
  return axios.get<GeneralApiResponse<IUser>>(`${baseUrl}/getById/${_id}`);
};

export const useUserById = (_id: string) => {
  return useQuery({
    queryKey: ["userObj", _id],
    queryFn: () => getUserById(_id).then((res) => res.data?.data),
  });
};

const getUserCountByRole = (role: ROLES_TYPE) => {
  return axios.get<GeneralApiResponse<number>>(`${baseUrl}/getUserCount?role=${role}`);
};

export const useUserCountByRole = (role: ROLES_TYPE) => {
  return useQuery({
    queryKey: ["userCount", role],
    queryFn: () => getUserCountByRole(role).then((res) => res.data?.data),
  });
};

const getTaggedUsers = (pagination: PaginationState, searchObj: { role: ROLES_TYPE; id: string }) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    role: searchObj.role,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IUser>>(`${baseUrl}/getTaggedUsers/${searchObj.id}?${query}`);
};

export const useTaggedUsers = (
  searchObj: { role: ROLES_TYPE; id?: string; [key: string]: any },
  getPaginationFromParams = true,
  enabled = true,
) => {
  const { data: userData } = useProfile();
  const userRole = userData?.role;
  const userid = userRole === ROLES.ADMIN || userRole === ROLES.SUBADMIN ? (searchObj.id ? searchObj.id : "") : "";

  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["tagged_users", pagination, userid, searchObj.role],
    queryFn: () => getTaggedUsers(pagination, { id: userid, role: searchObj.role }).then((res) => res.data),
    enabled: enabled && !!userData?._id,
    // refetchOnMount: false,
  });
};

const getStoreTaggedUsers = (pagination: PaginationState, searchObj: { role: ROLES_TYPE; id: string }) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    role: searchObj.role,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IUser>>(`${baseUrl}/getStoreTaggedUsers/${searchObj.id}?${query}`);
};

export const useStoreTaggedUsers = (
  searchObj: { role: ROLES_TYPE; id?: string },
  getPaginationFromParams = true,
  enabled = true,
) => {
  const { data: userData } = useProfile();
  const userRole = userData?.role;

  const userid = userRole === ROLES.ADMIN || userRole === ROLES.SUBADMIN ? (searchObj.id ? searchObj.id : "") : "";
  const pagination = usePagination(getPaginationFromParams);
  console.log(searchObj, pagination, "dfg");
  return useQuery({
    queryKey: ["store_users", pagination, userid, searchObj.role],
    queryFn: () => getStoreTaggedUsers(pagination, { id: userid, role: searchObj.role }).then((res) => res.data),
    enabled: enabled && !!userData?._id,
    // refetchOnMount: false,
  });
};

const getBeatTaggedUsers = (pagination: PaginationState, searchObj: { role: ROLES_TYPE; id: string }) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    role: searchObj.role,
  }).toString();
  return axios.get<GeneralApiResponsePagination<IUser>>(`${baseUrl}/getBeatTaggedUsers/${searchObj.id}?${query}`);
};

export const useBeatTaggedUsers = (
  searchObj: { role: ROLES_TYPE; id: string },
  getPaginationFromParams = true,
  enabled = true,
  pageIndexKey: string = pageIndex,
  pageSizeKey: string = pageSize,
) => {
  // const { data: userData } = useProfile();
  // const userRole = userData?.role;
  // const userid = userRole === ROLES.ADMIN || userRole === ROLES.SUBADMIN ? (searchObj.id ? searchObj.id : "") : "";

  const pagination = usePagination(getPaginationFromParams, pageIndexKey, pageSizeKey);
  return useQuery({
    queryKey: ["beat_tagged_users", pagination, searchObj],
    queryFn: () => getBeatTaggedUsers(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
    // refetchOnMount: false,
  });
};
