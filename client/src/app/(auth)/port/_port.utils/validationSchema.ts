import { Z } from "@/hooks/useZod";

export const portSchema = Z.object({
  name: Z.string().min(1, "Name is required."),
  address: Z.string().min(1, "Address is required."),
});
