import { Z } from "@/hooks/useZod";

export const brandSchema = Z.object({
  name: Z.string().min(1, "Name is required."),
});
