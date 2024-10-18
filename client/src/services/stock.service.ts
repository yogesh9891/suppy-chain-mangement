import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axios.service";
import url from "./url.service";

const baseUrl = `${url}/v1/stock`;

export interface IStock {
  _id: string;
  userId: string;
  userRole: string;
  skuCode: string; // stock will handled by skuCode instead of _id.
  stock: number;
  isDeleted: boolean;
  deletedById: string;
  deletedByRole: string;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PartialStock = Partial<IStock>;

const setClosingStock = (stockObj: {
  data: { userId: string; userRole: string; skuCode: string | undefined; quantity: number }[];
}) => {
  return axios.post(`${baseUrl}/setClosingStock`, stockObj);
};

export const useSetClosingStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setClosingStock,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["productInStock"] });
    },
  });
};
