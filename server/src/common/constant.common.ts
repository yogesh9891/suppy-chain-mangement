/**
 * This is a copy of the file in the backend
 * Do NOT add anything to this file, only copy and paste the entire file from the backend
 * For any frontend specific constants add it to constat_frontend.common.ts
 */
export const ROLES = {
  ADMIN: "ADMIN",
  SUBADMIN: "SUBADMIN",

  // COMPANY: "COMPANY",
  STORE: "STORE",
  EMPLOYEE: "EMPLOYEE", // can make request for registration.
  USER: "USER", // can make request for registration.
  VENDOR: "VENDOR", // can make request for registration.
  SALES: "SALES", // can make request for registration.
} as const;
export type ROLES_TYPE = keyof typeof ROLES;

export const REPORT_STATUS = {
  ENQUEUED: "ENQUEUED",
  PROCESSING: "PROCESSING",
  PROCESSED: "PROCESSED",
} as const;
export type REPORT_STATUS_TYPE = keyof typeof REPORT_STATUS;

export const REPORT_TYPE = {
  ORDER_LIST: "ORDER_LIST",
  CURRENT_STOCK_LIST: "CURRENT_STOCK_LIST",
  ACTIVITY: "ACTIVITY",
  LOCATION: "LOCATION",
} as const;
export type REPORT_TYPE_TYPE = keyof typeof REPORT_TYPE;

export const ROLE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type ROLE_STATUS_TYPE = keyof typeof ROLE_STATUS;

export const CREANDO = "CREANDO";
export type ORDER_SELLER_TYPE = keyof typeof ROLES | typeof CREANDO;

export const TAG_TYPE = {
  PRIMARY: "PRIMARY",
  SECONDARY: "SECONDARY",
} as const;
export type TAG_TYPE = keyof typeof TAG_TYPE;

export const APPROVE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DENIED: "DENIED",
} as const;
export type APPROVE_STATUS_TYPE = keyof typeof APPROVE_STATUS;

/** For Primary beat tagging only these roles are allowed */

export const ATTENDANCE_STATUS = {
  IN: "IN",
  OUT: "OUT",
  LEAVE: "LEAVE",
} as const;
export type ATTENDANCE_STATUS_TYPE = keyof typeof ATTENDANCE_STATUS;

/*
 *Type of order return or placed
 */


/**
 * order status
 */
export const ORDER_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DENIED: "DENIED",
  TRANSIT: "TRANSIT", //check stock
  DELIVERED: "DELIVERED",
  CANCELED: "CANCELED",
  RETURNED: "RETURNED",
} as const;
export type ORDER_STATUS_TYPE = keyof typeof ORDER_STATUS;
export const PRODUCT_STATUS = {
  PENDING: "PENDING",
  TRANSIT: "TRANSIT", //check stock
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;
export type PRODUCT_STATUS_TYPE = keyof typeof PRODUCT_STATUS;

export const STOCK = {
  STOCK_IN: "STOCK_IN",
  STOCK_OUT: "STOCK_OUT", //check stock
} as const;
export type STOCK_TYPE = keyof typeof STOCK;

export const CANCELLED_BY = {
  SELLER: "SELLER",
  BUYER: "BUYER",
} as const;
export type CANCELLED_BY_TYPE = keyof typeof CANCELLED_BY;

export const ORDER_UPDATE_STATUS = {
  REJECTED: "REJECTED",
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
} as const;
export type ORDER_UPDATE_STATUS_TYPE = keyof typeof ORDER_UPDATE_STATUS;

export const STOCK_UPDATE = {
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT",
  CLOSING_STOCK: "CLOSING_STOCK",
  OPENING_STOCK: "OPENING_STOCK",
} as const;
export type STOCK_UPDATE_TYPE = keyof typeof STOCK_UPDATE;

export const OBJECTIVE = {
  RETAILING: "Retailing",
  JOINT_WORKING: "Joint Working",
  MEETING: "Meeting",
  DISTRIBUTOR_SEARCH: "Distributor Search",
  DISTRIBUTOR_VISIT: "Distributor Visit",
  OTHERS: "Others",
} as const;
export type OBJECTIVE_TYPE = keyof typeof OBJECTIVE;

export const LOCATION_PURPOSE = {
  SIGN_IN: "SIGN_IN",
  MOVING: "MOVING",
  LEAVE: "LEAVE",
} as const;
export type LOCATION_PURPOSE_TYPE = keyof typeof LOCATION_PURPOSE;

export const PAYMENT_COLLECTION = {
  CHECK: "CHECK",
  UPI: "UPI",
  CASH: "CASH",
} as const;
export type PAYMENT_COLLECTION_TYPE = keyof typeof PAYMENT_COLLECTION;

export const ORDER_TYPE = {
  PURCHASE: "PURCHASE",
  SELL: "SELL",
} 

export const TARGET_STATUS = {
  ONGOING: "ONGOING",
  ENDED: "ENDED",
} as const;
export type TARGET_STATUS_TYPE = keyof typeof TARGET_STATUS;

export const TARGETS = {
  PRODUCTIVE_SALES_CALL: "PRODUCTIVE_SALES_CALL",
} as const;
export type TARGETS_TYPE = keyof typeof TARGETS;

export const BARCODE_INTIAL = "BLS";

export const BARCODE_TYPE = {
  PACKET: "PACKET",
  BOX: "BOX",
  CARTON: "CARTON",
} as const;
export type BARCODE_TYPE_TYPE = keyof typeof BARCODE_TYPE;

export const LOAD_TYPE = {
  WAREHOUSE: "WAREHOUSE",
  CONTAINER: "CONTAINER",
} as const;
export type LOAD_TYPE_TYPE = keyof typeof LOAD_TYPE;
