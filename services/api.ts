import api from "@/lib/axios";

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  cost?: number;
  image?: string;
  status: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id?: string;
  clientName: string;
  clientPhone?: string;
  items: SaleItem[];
}

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  photo?: string | null;
  role: "administrador" | "usuario";
}

export const productService = {
  getAll: async (status?: string) => {
    const response = await api.get<Product[]>("/api/products", {
      params: { status },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Product>(`/api/products/${id}`);
    return response.data;
  },

  create: async (product: {
    name: string;
    quantity: number;
    price: number;
    cost: number;
    image?: string;
  }) => {
    const response = await api.post<Product>("/api/products", product);
    return response.data;
  },

  update: async (
    id: string,
    product: {
      name?: string;
      quantity?: number;
      price?: number;
      cost?: number;
      status?: string;
      image?: string;
    }
  ) => {
    const response = await api.put<Product>(`/api/products/${id}`, product);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/products/${id}`);
  },
};

export const saleService = {
  getAll: async () => {
    const response = await api.get<Sale[]>("/api/sales");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Sale>(`/api/sales/${id}`);
    return response.data;
  },

  create: async (sale: Sale) => {
    const response = await api.post<Sale>("/api/sales", sale);
    return response.data;
  },
};

export const userService = {
  getAll: async () => {
    const response = await api.get<User[]>("/api/users");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<User>(`/api/users/${id}`);
    return response.data;
  },

  create: async (user: User) => {
    const response = await api.post<User>("/api/users", user);
    return response.data;
  },

  update: async (id: string, user: Partial<User>) => {
    const response = await api.put<User>(`/api/users/${id}`, user);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/users/${id}`);
  },
};

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  logout: async () => {
    await api.post("/api/auth/signout");
  },
};
