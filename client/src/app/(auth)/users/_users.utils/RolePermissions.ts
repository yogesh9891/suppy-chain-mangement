import { ROLES, ROLES_TYPE } from "@/common/constant.common";

/**
 * Component - OrdersList
 * Selling order,
 * Buying order
 */
export const rolesForSellingOrderList: ROLES_TYPE[] = [ROLES.STORE];
export const rolesForBuyingOrderList: ROLES_TYPE[] = [ROLES.STORE, ROLES.EMPLOYEE];
export const rolesForPaymentCollections: ROLES_TYPE[] = [];

/**
 * Component - details[id] page.tsx
 * UserTagging, BeatTagging, GetBeatTaggedUsersByRole,
 * UserBrandTagging,
 *
 * Sales Team:
 * TaggedUsersOf_ZSM
 * TaggedUsersOf_RSM
 * TaggedUsersOf_STATE_HEAD
 * TaggedUsersOf_ASM
 * TaggedUsersOf_ASE
 * TaggedUsersOf_SO
 * TaggedUsersOf_PSR
 *
 * Users:
 * BrandTaggedUsersOf_SUPERSTOCKIEST
 * BrandTaggedUsersOf_DISTRIBUTOR
 * BrandTaggedUsersOf_EMPLOYEE
 *
 */

export const rolesForUserTagging: ROLES_TYPE[] = [ROLES.ADMIN, ROLES.SUBADMIN];
export const rolesForBeatTagging: ROLES_TYPE[] = [];
export const rolesForAddingTargets: ROLES_TYPE[] = [];
export const rolesForShowingTargets: ROLES_TYPE[] = [];
export const rolesForBeatTaggedUsersOfEMPLOYEE: ROLES_TYPE[] = [ROLES.ADMIN, ROLES.SUBADMIN];
export const rolesForUserBrandTagging: ROLES_TYPE[] = [ROLES.EMPLOYEE];
export const rolesForSalesTeam: ROLES_TYPE[] = [ROLES.ADMIN, ROLES.SUBADMIN];
export const rolesForTaggedUsersOf_ZSM: ROLES_TYPE[] = [ROLES.ADMIN, ROLES.SUBADMIN];
export const rolesForTaggedUsersOf_RSM: ROLES_TYPE[] = [ROLES.ADMIN, ROLES.SUBADMIN];
export const rolesForTaggedUsersOf_STATE_HEAD: ROLES_TYPE[] = [ROLES.ADMIN, ROLES.SUBADMIN];
export const rolesForTaggedUsersOf_ASM: ROLES_TYPE[] = [ROLES.ADMIN, ROLES.SUBADMIN];
export const rolesForTaggedUsersOf_ASE: ROLES_TYPE[] = [ROLES.ADMIN, ROLES.SUBADMIN];
export const rolesForTaggedUsersOf_SO: ROLES_TYPE[] = [ROLES.ADMIN, ROLES.SUBADMIN];
export const rolesForTaggedUsersOf_PSR: ROLES_TYPE[] = [ROLES.ADMIN, ROLES.SUBADMIN];
export const rolesForUsers: ROLES_TYPE[] = [ROLES.STORE];

export const rolesForBrandTaggedUsersOf_SUPERSTOCKIEST: ROLES_TYPE[] = [ROLES.STORE];

export const rolesForBrandTaggedUsersOf_DISTRIBUTOR: ROLES_TYPE[] = [ROLES.STORE];

export const rolesForBrandTaggedUsersOf_EMPLOYEE: ROLES_TYPE[] = [ROLES.STORE];
export const rolesForLocationList: ROLES_TYPE[] = [];
export const rolesForTeamTarget: ROLES_TYPE[] = [];
