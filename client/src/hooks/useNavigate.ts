import { useRouter } from "next/navigation";

export const useNavigate = () => {
  const router = useRouter();

  const navigate = (str: string) => {
    router.push(str);
  };
  return navigate;
};

export const useNavigateReplace = () => {
  const router = useRouter();

  const navigate = (str: string) => {
    router.replace(str);
  };
  return navigate;
};
