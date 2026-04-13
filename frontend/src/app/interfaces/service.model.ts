export interface Category {
  id: number;
  name: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  category: Category;
  owner: number;
  created_at: string;
}

export interface Order {
  id: number;
  customer: number;
  service: Service;
  status: string;
  created_at: string;
}
