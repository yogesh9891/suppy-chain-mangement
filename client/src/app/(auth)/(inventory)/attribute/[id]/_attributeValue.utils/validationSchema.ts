import { Z } from "@/hooks/useZod";

export const attributeValueSchema = Z.object({
  name: Z.string().min(1, "Name is required."),
});
