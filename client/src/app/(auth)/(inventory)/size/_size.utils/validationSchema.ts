import { Z } from "@/hooks/useZod";

export const sizeSchema = Z.object({
  name: Z.string().min(1, "Name is required."),
});
