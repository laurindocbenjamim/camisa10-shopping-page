import axios from "axios";

const API_BASE_URL =
  (window as any).__API_BASE_URL__ ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://camisola10-ecommerce-backend-production.up.railway.app/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Use X-Session-ID from localStorage as a fallback for mobile Safari
  // where cross-site cookies might be blocked by tracking prevention
  const sessionId = localStorage.getItem("sessionId");
  if (sessionId) {
    config.headers["X-Session-ID"] = sessionId;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Read X-Session-ID from headers and store as a fallback
    // This dual-mechanism prevents cart state loss on mobile
    const sessionId = response.headers["x-session-id"];
    if (sessionId) {
      localStorage.setItem("sessionId", sessionId);
    }
    return response;
  },
  (error) => {
    const errorData = error.response?.data;
    if (errorData) {
      const detail = Array.isArray(errorData.detail)
        ? errorData.detail.map((e: any) => e.msg).join(", ")
        : errorData.detail;
      return Promise.reject(new Error(detail || "API request failed"));
    }
    return Promise.reject(error);
  }
);

export async function apiRequest(endpoint: string, options: any = {}) {
  return api(endpoint, options).then((res) => res.data);
}

export const catalogApi = {
  getProducts: (params?: { name?: string; category?: string; skip?: number; limit?: number }) => 
    apiRequest("/products", { params }),
  getProduct: (id: string) => apiRequest(`/products/${id}`),
  getMostSold: () => apiRequest("/products/most-sold"),
  getCategories: () => apiRequest("/products/categories"),
};

export const cartApi = {
  getCart: () => apiRequest("/cart"),
  addItem: (productId: string, quantity: number, size?: string) =>
    apiRequest("/cart/items", {
      method: "POST",
      data: { product_id: productId, quantity, size },
    }),
  updateItem: (productId: string, quantity: number, size?: string) =>
    apiRequest(`/cart/items/${productId}`, {
      method: "PUT",
      data: { quantity, size },
    }),
  removeItem: (productId: string, size?: string) =>
    apiRequest(`/cart/items/${productId}${size ? `?size=${size}` : ''}`, { method: "DELETE" }),
  clearCart: () => apiRequest("/cart", { method: "DELETE" }),
};

export const ordersApi = {
  createCheckout: (data: { email?: string; user_id?: string; coupon_code?: string }) =>
    apiRequest("/orders/checkout/create-session", {
      method: "POST",
      data: { cart_session_id: "from-cookie", ...data },
    }),
  validateCoupon: (code: string) =>
    apiRequest("/orders/coupons/validate", {
      method: "POST",
      data: { code },
    }),
  getOrder: (id: string) => apiRequest(`/orders/${id}`),
  sendInvoice: (orderId: string, email: string) =>
    apiRequest(`/orders/${orderId}/invoice`, {
      method: "POST",
      data: { email },
    }),
};