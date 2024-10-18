export const ERROR = {
  INVALID_FIELD: (fieldsArr: string[]) =>
    fieldsArr.length === 1
      ? `${fieldsArr[0]} is undefined`
      : `The following fields are undefined: ${fieldsArr.join(", ")}`,

  STOCK: {
    NOT_FOUND: "Stock Data for this Product is not found.",
    OUT_OF_STOCK: (skuCode: string) => `The Product with SKU Code ${skuCode} is out of stock.`,
  },
  ORDER_STATUS: {
    NOT_FOUND: "Status is not defined.",
  },
  ORDER: {
    NOT_FOUND: "Can't find the Order.",
    PREV_STATUS_UNMATCHED: "Order not yet Dispatched to be Delivered.",
  },
  REQUEST: {
    INVALID_ID: "Request id is not valid",
    NOT_FOUND: "Can't find the request.",
    EXIST_PENDING:
      "Your request associated with this email or phone number is still pending approval. Please wait for confirmation or contact support for assistance.",
    EXIST_APPROVED:
      "You already have a verified request associated with this email or phone number. Please login with your existing credentials.",
    EXIST_DENIED:
      "Your request associated with this email or phone number has been denied. Please contact support for further assistance.",
  },
  TAG: {
    NOT_FOUND_FROM_USER: "Can't find from user",
    NOT_FOUND_TO_USER: "Can't find to user",
    EXIST_TAG: "This Users are already tagged",
  },
  BEAT_TAG: {
    BRAND_LENGTH_ZERO: "Please select atleast one brand",
    EXIST_TAG: "This beat is already tagged",
    NOT_FOUND: "This Beat Tag not found",
    INVALID_PRIMARY_ROLE: "Users of this role cannot be tagged",
  },
  ROLE: {
    NOT_FOUND: "Role is not defined.",
    INSUFFICIENT_PERMISSION: "403 Forbidden: Insufficient permissions. Your role lacks the required scope.",
  },
  USER: {
    INVALID_CREDENTIAL: "Invalid credential.",
    EXIST: "Email or Phone is already registered.",
    EMAIL_BEING_USED: "This email is already being used.",
    PHONE_BEING_USED: "This phone is already being used.",
    NOT_FOUND: "Can't find your account. Please check your credentials or create a new account.",
    INVALID_USER_ID: "User id is not valid.",
    CAN_NOT_FOUND: "Can't find User account.",
    CAN_NOT_FOUND_BUYER: "Can't find Buyer User account.",
    CAN_NOT_LOGIN_FROM_WEB: "Can't login from website.",
  },

  ADDRESS: {
    CANT_FOUND: "Can't find User Address.",
  },

  EXECUTOR: {
    NOT_FOUND: "Can't find the executor Id or role.",
  },

  COMPANY: {
    EXIST: "Company in this name is already exists.",
    NOT_FOUND: "Can't find the Company.",
    INVALID_ID: "Company id is not valid",
    CANT_DELETE: "Brand found under this Company.",
  },
  BRAND: {
    EXIST: "Brand in this name is already exists.",
    NOT_FOUND: "Can't find the Brand.",
    INVALID_ID: "Brand id is not valid",
    CANT_DELETE: "Product found under this Brand.",
  },
  COLOR: {
    EXIST: "Color in this name is already exists.",
    NOT_FOUND: "Can't find the Color.",
    INVALID_ID: "Color id is not valid",
    CANT_DELETE: "Product found under this Color.",
  },
  SIZE: {
    EXIST: "Size in this name is already exists.",
    NOT_FOUND: "Can't find the Size.",
    INVALID_ID: "Size id is not valid",
    CANT_DELETE: "Product found under this Size.",
  },
  ATTRIBUTE: {
    EXIST: "Attribute in this name is already exists.",
    NOT_FOUND: "Can't find the Attribute.",
    INVALID_ID: "Attribute id is not valid",
    CANT_DELETE: "Product found under this Attribute.",
  },
  CATEGORY: {
    EXIST: "Category in this name is already exists.",
    NOT_FOUND: "Can't find the Category.",
    NOT_FOUND_PARENT: "Can't find the Parent Category.",
    INVALID_ID: "Category id is not valid",
    CANT_DELETE: "Sub Category found under this Category.",
  },
  PRODUCT: {
    EXIST: "Product in this name is already exists.",
    EXIST_SKU_CODE: "Product with this SKU Code is already exists.",
    NOT_FOUND: "Can't find the Product.",
    INVALID_ID: "Product id is not valid",
  },
  //LOCATION
  COUNTRY: {
    EXIST: "This Carton is already exists.",
    NOT_FOUND: "Can't find the Carton.",
    INVALID_ID: "Carton id is not valid",
    CANT_DELETE: "Region or User found under this country.",
  },

  STATE: {
    EXIST: "This State is already exists.",
    NOT_FOUND: "Can't find the State.",
    INVALID_ID: "State id is not valid",
    CANT_DELETE: "Town or User found under this state.",
  },
  CITY: {
    EXIST: "This City is already exists.",
    NOT_FOUND: "Can't find the City.",
    INVALID_ID: "City id is not valid",
    CANT_DELETE: "Beat or User found under this City.",
  },
  AREA: {
    EXIST: "This Area is already exists.",
    NOT_FOUND: "Can't find the Area.",
    INVALID_ID: "Area id is not valid",
    CANT_DELETE: "User found under this Area.",
  },

  CARTON: {
    EXIST: "This Carton is already exists.",
    NOT_FOUND: "Can't find the Carton.",
    INVALID_ID: "Carton id is not valid",
    CANT_DELETE: "User found under this Carton.",
  },
  BOX: {
    EXIST: "This Box is already exists.",
    NOT_FOUND: "Can't find the Box.",
    INVALID_ID: "Box id is not valid",
    CANT_DELETE: "Box or User found under this Carton.",
  },
  BARCODE: {
    EXIST: "This Barcode is already exists.",
    NOT_FOUND: "Can't find the Barcode.",
    INVALID_ID: "Barcode id is not valid",
    CANT_DELETE: "User found under this Barcode.",
  },
  PAYMENT: {
    EXIST: "This Payment is already exists.",
    NOT_FOUND: "Can't find the Payment.",
    INVALID_ID: "Payment id is not valid",
    CANT_DELETE: "User found under this Payment.",
  },
  CART: {
    NO_ITEMS_IN_CART_FOR_ORDER: "Cart is empty, cannot place the order",
  },
} as const;
export type ERROR_TYPE = keyof typeof ERROR;
