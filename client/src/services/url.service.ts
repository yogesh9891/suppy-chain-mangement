// export const url = 'http://localhost:3010'
// export const url = '/api'
export const url = process.env.NEXT_PUBLIC_API_URL;
// export const url = 'https://rocare.ebslonserver3.com/api'

// export const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

// import logo from "@/assets/Images/logo.png";

export const generateFilePath = (fileName: any) => {
  if (typeof fileName == "undefined" || fileName == null) {
    // return logo
  }

  if (typeof fileName != "string") {
    return fileName;
  }

  if (fileName.startsWith("http")) {
    return fileName;
  }

  return `${url}/uploads/${fileName}`;
};

export default url;

export type GeneralApiResponse<T = unknown> = {
  message: string;
  data: T;
};

export type GeneralApiResponsePagination<T = unknown> = {
  message: string;
  data: T[];
  total: number;
};
