import { webLogin } from "@/services/user.service";
import { decodeToken } from "@/utils/jwt";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Custom",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          if (!req.body) {
            return null;
          }

          if (typeof credentials?.email !== "string") {
            return null;
          }
          if (typeof credentials?.password !== "string") {
            return null;
          }

          let obj = {
            email: credentials.email,
            password: credentials.password,
          };

          const u = await webLogin(obj); // login and get user data

          const data = {
            id: u.data.id,
            access_token: u.data?.token,
            decoded_token: decodeToken(u.data?.token),
            name: u.data.name,
            role: u.data.role,
          };

          if (data) {
            return data;
          } else {
            return null;
          }
        } catch (error: any) {
          if (typeof error?.response?.data?.message == "string") {
            throw new Error(error?.response?.data?.message);
          } else {
            throw error;
          }
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, account, ...props }) {
      if (account) {
        token.access_token = (user as any)?.access_token;
        token.decoded_token = (user as any)?.decoded_token;
      }
      return token;
    },
    // redirect(params) {
    //     return params.url
    // },

    session({ session, token, ...props }) {
      return { ...session, token };
    },
  },
};
