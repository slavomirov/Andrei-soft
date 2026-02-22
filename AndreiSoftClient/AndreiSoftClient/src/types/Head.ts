export interface Head {
  id: number;
  description: string;
  status: string; // HeadStatus enum as string
  price: number;
  actions: string;
  assignedWorkerId?: string | null;
  createdAt: string;
  updatedAt: string;
}
