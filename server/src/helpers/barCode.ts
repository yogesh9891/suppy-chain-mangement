import { BARCODE_INTIAL } from "common/constant.common";

export const generateBarCodeWithValue = (value: number): string => {
  return `8${String(value).padStart(9, "0")}`;
};
