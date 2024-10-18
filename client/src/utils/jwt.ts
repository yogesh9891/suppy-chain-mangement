import { AUTH_TOKEN } from "@/common/constant_frontend.common";
import { jwtDecode } from "jwt-decode";

export const decodeToken = (token: any) => {
  if (token) {
    const decodedObj = jwtDecode(token);
    return decodedObj;
  }
  return null;
};

// export const getDecodedJwt = () => {
//     const token = getJwt();
//     const val = decodeToken(token)
//     return val
// }

export const setJwt = (val: string) => {
  const token = localStorage.setItem(AUTH_TOKEN, val);
  return token;
};

export const getJwt = () => {
  const token = localStorage.getItem(AUTH_TOKEN);
  return token;
};

export const removeJwt = () => {
  localStorage.removeItem(AUTH_TOKEN);
  return;
};
