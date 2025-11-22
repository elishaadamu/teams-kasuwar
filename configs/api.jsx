export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  ENDPOINTS: {
    AUTH: {
      SIGNIN_BDM: "/bdm/login",
      SIGNIN_BD: "/bdm/login",
      SIGNIN_AGENT: "/agent/login",
    },
    USER_SIDE: {
      UPDATE: "/me",
      GET_DOWNLINES: "/bdm/entities/",
      GET_AGENTS_DOWNLINES: "/agent/my-downline/",
      GET_BD_DOWNLINES: "/bdm/entities/",
      CREATE: "/bdm/register-downline/",
      CREATE_CUSTOMER: "/agent/create-user",
      CREATE_AGENT: "/bdm/register-downline",
      CREATE_VENDOR: "/agent/create-vendor",
      SUSPEND_AGENT: "/bdm/suspend-agent/",
      SUSPEND_BD: "/bdm/suspend-bd/",
      AGENT_COMMISSION: "/agent/my-commission/",
    },
    SETTLEMENT: {
      CREATE: "/settlement/create",
      WITHDRAW: "/settlement/withdraw",
      GET_SETTLEMENTS: "/settlement/entities/",
    },
    ACCOUNT: {
      CREATE: "/account/create/",
      GET: "/wallet/",
      walletBalance: "/wallet/",
      allWalletTransactions: "/wallet/",
    },
    ORDER: {
      GET_ALL: "/order/user/",
      GET_SELLER_ORDERS: "/orders/seller",
      UPDATE_STATUS: "/orders/status",
      CREATE: "/order/create",
    },
    PROFILE: {
      UPDATE: "/profile/update",
      GET: "/user/profile",
      UPDATE_USER: "/user/update",
      DELETE: "/user/delete/",
      SHIPPING: "/profile/shipping",
    },
    SECURITY: {
      SET_PIN: "/wallet/setPin",
      UPDATE_PIN: "/wallet/changePin",
      CHANGE_PASSWORD: "/security/change-password",
      RESET_PASSWORD: "/security/reset-password",
    },
    USER: {
      DELETE: "/user/delete/",
    },
    CUSTOMER: {
      SIGNIN: "/customer/login",
    },
    VENDOR: {
      SIGNIN: "/vendor/login",
      GET_ALL: "/vendor/stats/",
      UPDATE_IMAGES: "/vendor/update-images/",
    },
    PRODUCT: {
      ADD: "/product/",
      GET_SELLER_PRODUCTS: "/product/my-products/",
      GET_PRODUCT: "/product",
      UPDATE: "/product/",
      DELETE: "/product/",
    },
    CATEGORY: {
      GET_ALL: "/category",
    },
    RATING: {
      ADD: "/rating",
      GET_BY_VENDOR: "/rating/", // Append vendorId
      DELETE: "/rating/", // Append vendorId/userId
    },
    DELIVERY: {
      CREATE: "/delivery/create-delivery-man",
      LOGIN: "/delivery/login",
      UPDATE: "/delivery/delivery-man",
      CREATE_WALLET: "/wallet/create-wallet/",
      REQUEST_DELIVERY: "/delivery-request/create/",
      GET_USER_REQUESTS: "/delivery-request/all-user-requests/", // append userId
      PAY_DELIVERY: "/delivery-request/pay/",
      GET_DELIVERY: "/delivery-request/my-requests/",
      ACCEPT_DELIVERY: "/delivery-request/delivery-man-accept/",
      REJECT_DELIVERY: "/delivery-request/delivery-man-reject/",
    },
    DELIVERY_WITHDRAWAL: {
      CREATE: "/withdrawal", // POST with userId in payload
      GET_BY_USER: "/withdrawal/", // append userId
    },
    SUPPORT: {
      CREATE_TICKET: "/support/tickets",
      GET_TICKETS: "/support/tickets",
      GET_TICKET: "/support/tickets/",
    },
    MESSAGES: {
      GET_ALL: "/messages",
      SEND: "/messages/send",
      MARK_READ: "/messages/read/",
      DELETE: "/messages/",
    },
    FUNDING_HISTORY: {
      GET: "/wallet/",
    },
    REFERRAL: {
      GET_COMMISSIONS: "/referral/commissions/", // append userId
      GET_PROGRESS: "/referral/progress/", // append userId
    },
    SUBSCRIPTION: {
      SUBSCRIBE: "/sub/subscribe", // POST with { vendorId, planId }
      CHECK_STATUS: "/sub/check-status/", // append vendorId
      GET_DETAILS: "/sub/vendor-subscription/", // append vendorId
      GET_ALL: "/subscribe",
      GET_SINGLE: "/subscribe/plan/", // /subscribe/plan/{planId}
      GET_BY_PACKAGE: "/subscribe/plan-package/", // /subscribe/plan-package/{package}
    },
    BANNERS: {
      GET_ALL: "/banner",
    },
    CATEGORY: {
      GET_ALL: "/category/",
    },
    COUPON: {
      CREATE: "/coupons/create",
      GET_ALL: "/coupons/", // append creatorId
      UPDATE: "/coupons/", // append couponId
      DELETE: "/coupons/", // append couponId
      VALIDATE: "/coupons/validate",
    },
  },
  SHIPPING_FEE: {
    GET_ALL: "/shipping-fee/all",
  },
  REPORTS: {
    PERFORMANCE_REPORT: "/report/bdm/my-performance",
    PERFORMANCE_REPORT_BD: "/report/bd/my-performance",
  },
};

export const apiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;
