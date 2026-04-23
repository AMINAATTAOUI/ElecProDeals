export type UserRole = 'client' | 'commercial' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName: string;
  siret: string;
}

export interface ClientProfile extends AuthUser {
  role: 'client';
  customerType: CustomerType;
  pricingSheetId: string;
  isPaymentDeferred: boolean;
}

export interface CommercialProfile extends AuthUser {
  role: 'commercial';
  assignedClientIds: string[];
}

export interface AdminProfile extends AuthUser {
  role: 'admin';
}

export type CustomerType = 'artisan' | 'large_installer' | 'wholesaler';
