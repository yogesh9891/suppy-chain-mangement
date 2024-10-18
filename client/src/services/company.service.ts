import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url, { GeneralApiResponsePagination } from "./url.service";
import { PaginationState } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";

const baseUrl = `${url}/v1/company`; // update.

export interface ICompany {
  _id: string;
  name: string;
  imagesArr: { image: string }[];
  thumbnail: string;
  createdById: string;
  createdByRole: string;
  isDeleted: boolean;
  deletedById: string;
  deletedByRole: string;
  deletedOn: Date;
}

type PartialCountry = Partial<ICompany>;

const addCompany = (company: PartialCountry) => {
  return axios.post(`${baseUrl}/`, company);
};

export const useAddCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCompany,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
};

const getCompany = (pagination: PaginationState, searchObj: Record<string, any>) => {
  const query = new URLSearchParams({
    pageIndex: String(pagination.pageIndex),
    pageSize: String(pagination.pageSize),
    ...searchObj,
  }).toString();
  return axios.get<GeneralApiResponsePagination<ICompany>>(`${baseUrl}/?${query}`);
};

export const useCompany = (searchObj: Record<string, any> = {}, getPaginationFromParams = true, enabled = true) => {
  const pagination = usePagination(getPaginationFromParams);
  return useQuery({
    queryKey: ["company", pagination, searchObj],
    queryFn: () => getCompany(pagination, searchObj).then((res) => res.data),
    enabled: enabled,
  });
};
