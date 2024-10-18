import { Z } from "@/hooks/useZod";
import { useLatesBarCodeInSeries } from "@/services/barcode.service";

export const defaultProductValues = {
  packet: 0,
  box: 10,
  msp: 15,
  gst: 5,
  sizeId: {
    label: "",
    value: "",
  },
  colorId: {
    label: "",
    value: "",
  },

  brandId: {
    label: "",
    value: "",
  },
  categoryId: {
    label: "",
    value: "",
  },
  productId:""
};

export type ProductInputs = {
  description: string;
  productId?: string;
  brandId: {
    label: string;
    value: string;
  };
  colorId: {
    label: string;
    value: string;
  };
  sizeId: {
    label: string;
    value: string;
  };
  skuCode: string;
  hsnCode: string;
  barCode: string;
  gst: number;
  msp: number;
  packet: number;
  box: number;
  imagesArr: { image: string; order: number }[];
  thumbnail: string;
};



const validateFreePieces = (data: any) =>
  (data?.freePieces && data?.freePiecesPerProducts && data?.freePieces > 0 && data?.freePiecesPerProducts > 0) ||
  data?.freePieces == data?.freePiecesPerProducts;

export const productSchema = Z.object({
  description: Z.string().optional(),
  brandId: Z.object({
    label: Z.string().min(1, "Brand is required (from label)"),
    value: Z.string().min(1, "Brand is required."),
  }),
  colorId: Z.object({
    label: Z.string().min(1, "Brand is required (from label)"),
    value: Z.string().min(1, "Brand is required."),
  }),
  sizeId: Z.object({
    label: Z.string().min(1, "Brand is required (from label)"),
    value: Z.string().min(1, "Brand is required."),
  }),
  skuCode: Z.string().optional(),
  hsnCode: Z.string().optional(),
  barCode: Z.string().optional(),
  gst: Z.string().optional(),
  msp: Z.coerce.number().int().gte(0, { message: "MSP is required" }),
  packet: Z.coerce.number().int().gte(0, { message: "Packet is required" }),
  box: Z.coerce.number().int().gte(0, { message: "Box is required" }),
});

export const productUpdateSchema = Z.object({
  description: Z.string().optional(),
  brandId: Z.object({
    label: Z.string().min(1, "Brand is required (from label)"),
    value: Z.string().min(1, "Brand is required."),
  }),
  colorId: Z.object({
    label: Z.string().min(1, "Brand is required (from label)"),
    value: Z.string().min(1, "Brand is required."),
  }),
  sizeId: Z.object({
    label: Z.string().min(1, "Brand is required (from label)"),
    value: Z.string().min(1, "Brand is required."),
  }),
  skuCode: Z.string().optional(),
  hsnCode: Z.string().optional(),
  barCode: Z.string().optional(),
  gst: Z.string().optional(),
  msp: Z.coerce.number().int().gte(0, { message: "MSP is required" }),
  packet: Z.coerce.number().int().gte(0, { message: "Packet is required" }),
  box: Z.coerce.number().int().gte(0, { message: "Box is required" }),
});
