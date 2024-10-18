import { Z } from "@/hooks/useZod";

export const categorySchema = Z.object({
  name: Z.string().min(1, "Name is required."),
  // parentCategoryId: Z.object({
  //   label: Z.string().optional(),
  //   value: Z.string().optional(),
  // }),
});
