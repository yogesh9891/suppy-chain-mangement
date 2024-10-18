import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const Z = z;

export const useZodResolver = () => {
  return zodResolver;
};
