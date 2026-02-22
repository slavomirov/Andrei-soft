export interface Head {
  id: number;
  make: string;
  model: string;
  year: number;
  partNumber: string;
  ownerFirstName: string;
  ownerLastName: string;
  serviceName: string;
  servicePhoneNumber: string;
  status: string;
  createDate: string;
  completedDate?: string | null;
  mechanicId?: string | null;
  mechanicDisplayName?: string | null;
  serviceNeeds: string[];
  checkedServiceNeeds: string[];
  price: number;
  mechanicSalary: number;
  insurance: number;
}

export interface ServiceNeedInfo {
  name: string;
  displayName: string;
  price: number;
}

export interface AuthUser {
  accessToken: string;
  refreshToken: string;
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UserInfo {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export interface HistoryEntry {
  id: number;
  headId: number;
  headSummary: string;
  action: string;
  description: string;
  status: string;
  mechanicId?: string | null;
  mechanicDisplayName?: string | null;
  changedByUserId?: string | null;
  changedByDisplayName?: string | null;
  price: number;
  timestamp: string;
}
}
