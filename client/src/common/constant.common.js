"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCT_STATUS = exports.BARCODE_TYPE = exports.BARCODE_INTIAL = exports.TARGETS = exports.TARGET_STATUS = exports.SALES_CALL_REPORT = exports.PAYMENT_COLLECTION = exports.LOCATION_PURPOSE = exports.OBJECTIVE = exports.STOCK_UPDATE = exports.ORDER_UPDATE_STATUS = exports.CANCELLED_BY = exports.ORDER_STATUS = exports.ORDER_TYPE = exports.ATTENDANCE_STATUS = exports.APPROVE_STATUS = exports.TAG_TYPE = exports.CREANDO = exports.ROLE_STATUS = exports.REPORT_TYPE = exports.REPORT_STATUS = exports.ROLES = void 0;
/**
 * This is a copy of the file in the backend
 * Do NOT add anything to this file, only copy and paste the entire file from the backend
 * For any frontend specific constants add it to constat_frontend.common.ts
 */
exports.ROLES = {
    ADMIN: "ADMIN",
    SUBADMIN: "SUBADMIN",
    // COMPANY: "COMPANY",
    STORE: "STORE",
    EMPLOYEE: "EMPLOYEE", // can make request for registration.
    USER: "USER",
    VENDOR: "VENDOR",
    SALES: "SALES",
};
exports.REPORT_STATUS = {
    ENQUEUED: "ENQUEUED",
    PROCESSING: "PROCESSING",
    PROCESSED: "PROCESSED",
};
exports.REPORT_TYPE = {
    ORDER_LIST: "ORDER_LIST",
    CURRENT_STOCK_LIST: "CURRENT_STOCK_LIST",
    ACTIVITY: "ACTIVITY",
    LOCATION: "LOCATION",
};
exports.ROLE_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
};
exports.CREANDO = "CREANDO";
exports.TAG_TYPE = {
    PRIMARY: "PRIMARY",
    SECONDARY: "SECONDARY",
};
exports.APPROVE_STATUS = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    DENIED: "DENIED",
};
/** For Primary beat tagging only these roles are allowed */
exports.ATTENDANCE_STATUS = {
    IN: "IN",
    OUT: "OUT",
    LEAVE: "LEAVE",
};
/*
 *Type of order return or placed
 */
exports.ORDER_TYPE = {
    RETURN: "RETURN",
    NORMAL: "NORMAL",
};
/**
 * order status
 */
exports.ORDER_STATUS = {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    DENIED: "DENIED",
    TRANSIT: "TRANSIT", //check stock
    DELIVERED: "DELIVERED",
    CANCELED: "CANCELED",
    RETURNED: "RETURNED",
};
exports.CANCELLED_BY = {
    SELLER: "SELLER",
    BUYER: "BUYER",
};
exports.ORDER_UPDATE_STATUS = {
    REJECTED: "REJECTED",
    REQUESTED: "REQUESTED",
    APPROVED: "APPROVED",
};
exports.STOCK_UPDATE = {
    INCREMENT: "INCREMENT",
    DECREMENT: "DECREMENT",
    CLOSING_STOCK: "CLOSING_STOCK",
    OPENING_STOCK: "OPENING_STOCK",
};
exports.OBJECTIVE = {
    RETAILING: "Retailing",
    JOINT_WORKING: "Joint Working",
    MEETING: "Meeting",
    DISTRIBUTOR_SEARCH: "Distributor Search",
    DISTRIBUTOR_VISIT: "Distributor Visit",
    OTHERS: "Others",
};
exports.LOCATION_PURPOSE = {
    SIGN_IN: "SIGN_IN",
    MOVING: "MOVING",
    LEAVE: "LEAVE",
};
exports.PAYMENT_COLLECTION = {
    CHECK: "CHECK",
    UPI: "UPI",
    CASH: "CASH",
};
exports.SALES_CALL_REPORT = {
    YTD: "YTD",
    MTD: "MTD",
};
exports.TARGET_STATUS = {
    ONGOING: "ONGOING",
    ENDED: "ENDED",
};
exports.TARGETS = {
    PRODUCTIVE_SALES_CALL: "PRODUCTIVE_SALES_CALL",
};
exports.BARCODE_INTIAL = "80000000";
exports.BARCODE_TYPE = {
    PACKET: "PACKET",
    BOX: "BOX",
    CARTON: "CARTON",
};
exports.PRODUCT_STATUS = {
    PENDING: "PENDING",
    TRANSIT: "TRANSIT",
    CANCELLED: "CANCELLED",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnQuY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uc3RhbnQuY29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBOzs7O0dBSUc7QUFDVSxRQUFBLEtBQUssR0FBRztJQUNuQixLQUFLLEVBQUUsT0FBTztJQUNkLFFBQVEsRUFBRSxVQUFVO0lBRXBCLHNCQUFzQjtJQUN0QixLQUFLLEVBQUUsT0FBTztJQUNkLFFBQVEsRUFBRSxVQUFVLEVBQUUscUNBQXFDO0lBQzNELElBQUksRUFBRSxNQUFNO0lBQ1osTUFBTSxFQUFFLFFBQVE7SUFDaEIsS0FBSyxFQUFFLE9BQU87Q0FDTixDQUFDO0FBR0UsUUFBQSxhQUFhLEdBQUc7SUFDM0IsUUFBUSxFQUFFLFVBQVU7SUFDcEIsVUFBVSxFQUFFLFlBQVk7SUFDeEIsU0FBUyxFQUFFLFdBQVc7Q0FDZCxDQUFDO0FBR0UsUUFBQSxXQUFXLEdBQUc7SUFDekIsVUFBVSxFQUFFLFlBQVk7SUFDeEIsa0JBQWtCLEVBQUUsb0JBQW9CO0lBQ3hDLFFBQVEsRUFBRSxVQUFVO0lBQ3BCLFFBQVEsRUFBRSxVQUFVO0NBQ1osQ0FBQztBQUdFLFFBQUEsV0FBVyxHQUFHO0lBQ3pCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLFFBQVEsRUFBRSxVQUFVO0NBQ1osQ0FBQztBQUdFLFFBQUEsT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUdwQixRQUFBLFFBQVEsR0FBRztJQUN0QixPQUFPLEVBQUUsU0FBUztJQUNsQixTQUFTLEVBQUUsV0FBVztDQUNkLENBQUM7QUFHRSxRQUFBLGNBQWMsR0FBRztJQUM1QixPQUFPLEVBQUUsU0FBUztJQUNsQixRQUFRLEVBQUUsVUFBVTtJQUNwQixNQUFNLEVBQUUsUUFBUTtDQUNSLENBQUM7QUFHWCw0REFBNEQ7QUFFL0MsUUFBQSxpQkFBaUIsR0FBRztJQUMvQixFQUFFLEVBQUUsSUFBSTtJQUNSLEdBQUcsRUFBRSxLQUFLO0lBQ1YsS0FBSyxFQUFFLE9BQU87Q0FDTixDQUFDO0FBR1g7O0dBRUc7QUFDVSxRQUFBLFVBQVUsR0FBRztJQUN4QixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtDQUNSLENBQUM7QUFHWDs7R0FFRztBQUNVLFFBQUEsWUFBWSxHQUFHO0lBQzFCLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFFBQVEsRUFBRSxVQUFVO0lBQ3BCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE9BQU8sRUFBRSxTQUFTLEVBQUUsYUFBYTtJQUNqQyxTQUFTLEVBQUUsV0FBVztJQUN0QixRQUFRLEVBQUUsVUFBVTtJQUNwQixRQUFRLEVBQUUsVUFBVTtDQUNaLENBQUM7QUFHRSxRQUFBLFlBQVksR0FBRztJQUMxQixNQUFNLEVBQUUsUUFBUTtJQUNoQixLQUFLLEVBQUUsT0FBTztDQUNOLENBQUM7QUFHRSxRQUFBLG1CQUFtQixHQUFHO0lBQ2pDLFFBQVEsRUFBRSxVQUFVO0lBQ3BCLFNBQVMsRUFBRSxXQUFXO0lBQ3RCLFFBQVEsRUFBRSxVQUFVO0NBQ1osQ0FBQztBQUdFLFFBQUEsWUFBWSxHQUFHO0lBQzFCLFNBQVMsRUFBRSxXQUFXO0lBQ3RCLFNBQVMsRUFBRSxXQUFXO0lBQ3RCLGFBQWEsRUFBRSxlQUFlO0lBQzlCLGFBQWEsRUFBRSxlQUFlO0NBQ3RCLENBQUM7QUFHRSxRQUFBLFNBQVMsR0FBRztJQUN2QixTQUFTLEVBQUUsV0FBVztJQUN0QixhQUFhLEVBQUUsZUFBZTtJQUM5QixPQUFPLEVBQUUsU0FBUztJQUNsQixrQkFBa0IsRUFBRSxvQkFBb0I7SUFDeEMsaUJBQWlCLEVBQUUsbUJBQW1CO0lBQ3RDLE1BQU0sRUFBRSxRQUFRO0NBQ1IsQ0FBQztBQUdFLFFBQUEsZ0JBQWdCLEdBQUc7SUFDOUIsT0FBTyxFQUFFLFNBQVM7SUFDbEIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsS0FBSyxFQUFFLE9BQU87Q0FDTixDQUFDO0FBR0UsUUFBQSxrQkFBa0IsR0FBRztJQUNoQyxLQUFLLEVBQUUsT0FBTztJQUNkLEdBQUcsRUFBRSxLQUFLO0lBQ1YsSUFBSSxFQUFFLE1BQU07Q0FDSixDQUFDO0FBR0UsUUFBQSxpQkFBaUIsR0FBRztJQUMvQixHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxLQUFLO0NBQ0YsQ0FBQztBQUdFLFFBQUEsYUFBYSxHQUFHO0lBQzNCLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLEtBQUssRUFBRSxPQUFPO0NBQ04sQ0FBQztBQUdFLFFBQUEsT0FBTyxHQUFHO0lBQ3JCLHFCQUFxQixFQUFFLHVCQUF1QjtDQUN0QyxDQUFDO0FBR0UsUUFBQSxjQUFjLEdBQUcsVUFBVSxDQUFDO0FBRTVCLFFBQUEsWUFBWSxHQUFHO0lBQzFCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLEdBQUcsRUFBRSxLQUFLO0lBQ1YsTUFBTSxFQUFFLFFBQVE7Q0FDUixDQUFDO0FBSUUsUUFBQSxjQUFjLEdBQUc7SUFDNUIsT0FBTyxFQUFFLFNBQVM7SUFDbEIsT0FBTyxFQUFFLFNBQVM7SUFDbEIsU0FBUyxFQUFFLFdBQVc7Q0FDZCxDQUFDIn0=