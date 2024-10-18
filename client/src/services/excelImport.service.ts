import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import { GeneralApiResponse, GeneralApiResponsePagination, url } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import { ROLES, ROLES_TYPE } from "@/common/constant.common";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";

const baseUrl = `${url}/v1/excelImport`;

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
  countryId?: string;
  countryName?: string;
  regionId?: string;
  regionName?: string;
  stateId?: string;
  stateName?: string;
  townId?: string;
  townName?: string;
  beatId?: string;
  beatName?: string;
  role: ROLES_TYPE;
}

export type PartialUser = Partial<IUser>;

export const employeeImport = (formobj: any) => {
  return axios.post<GeneralApiResponse>(`${baseUrl}/employeeImport`, formobj);
};

export const useEmployeeImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeImport,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["beat_tagged_users"] });
      queryClient.invalidateQueries({ queryKey: ["tagged_users"] });
      queryClient.invalidateQueries({ queryKey: ["brand_tagged_users"] });
      // toastSuccess(res);
    },
  });
};

export const dealerImport = (obj: { formObj: any; role: string }) => {
  return axios.post<GeneralApiResponse>(`${baseUrl}/dealerImport/?role=${obj.role}`, obj.formObj);
};

export const useDealerImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dealerImport,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["beat_tagged_users"] });
      queryClient.invalidateQueries({ queryKey: ["tagged_users"] });
      queryClient.invalidateQueries({ queryKey: ["brand_tagged_users"] });
      // toastSuccess(res);
    },
  });
};

export const beatTagImport = (formObj: any) => {
  return axios.post<GeneralApiResponse>(`${baseUrl}/beatTagImport/`, formObj);
};

export const useBeatTagImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: beatTagImport,
    onSuccess: (res) => {
      // queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["beat_tagged_users"] });
      // queryClient.invalidateQueries({ queryKey: ["tagged_users"] });
      // queryClient.invalidateQueries({ queryKey: ["brand_tagged_users"] });
      // toastSuccess(res);
    },
  });
};
