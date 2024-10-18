import { Z } from "@/hooks/useZod";

export const colorSchema = Z.object({
  name: Z.string().min(1, "Name is required."),
});
