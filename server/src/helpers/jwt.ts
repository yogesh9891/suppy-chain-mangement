import jwt from "jsonwebtoken";
import { CONFIG } from "common/config.common";

export const generateAccessJwt = async (obj: object) => {
  return jwt.sign(
    {
      ...obj,
      exp: Math.floor(Date.now() / 1000) + 604800, //valid for 7 days
    },
    CONFIG.JWT_ACCESS_TOKEN_SECRET,
  );
};

export const generateRefreshJwt = async (obj: object) => {
  return jwt.sign(
    {
      ...obj,
      exp: Math.floor(Date.now() / 1000) + 604800, //7 days
    },
    CONFIG.JWT_ACCESS_TOKEN_SECRET,
  );
};
