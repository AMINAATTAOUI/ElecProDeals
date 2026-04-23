export type UserRole = 'client' | 'commercial' | 'admin';
export type CustomerType = 'artisan' | 'large_installer' | 'wholesaler';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName: string;
  siret: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ClientUser extends User {
  role: 'client';
  customerType: CustomerType;
  pricingSheetId: string;
  isPaymentDeferred: boolean;
  assignedCommercialId: string | null;
}

export interface CommercialUser extends User {
  role: 'commercial';
  assignedClientIds: string[];
}

export interface AdminUser extends User {
  role: 'admin';
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
