/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * pVerify API Type Definitions
 * Healthcare eligibility verification types
 */

// ============================================
// Authentication Types
// ============================================

export interface PVerifyCredentials {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface TokenCache {
  token: string;
  expiresAt: number;
}

// ============================================
// Provider Types
// ============================================

export interface Provider {
  npi: string;
  lastName?: string;
  firstName?: string;
  taxonomyCode?: string;
  organizationName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

// ============================================
// Subscriber Types
// ============================================

export interface Subscriber {
  memberId?: string;
  mbi?: string;
  ssn?: string;
  hicn?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  gender?: 'M' | 'F' | 'U';
}

export interface Dependent {
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  gender?: 'M' | 'F' | 'U';
  relationship: string;
}

// ============================================
// Eligibility Request Types
// ============================================

export interface EligibilityRequest {
  payerCode: string;
  provider: Provider;
  subscriber: Subscriber;
  dependent?: Dependent;
  isSubscriberPatient: boolean;
  doS_StartDate: string;
  doS_EndDate: string;
  practiceTypeCode?: string;
  referenceId?: string;
  location?: string;
  includePlanNetworkInfo?: boolean;
}

export interface MedicareEligibilityRequest {
  payerCode: string;
  provider: Provider;
  subscriber: {
    mbi: string;
    firstName: string;
    lastName: string;
    dob: string;
  };
  doS_StartDate: string;
  doS_EndDate: string;
}

export interface MBILookupRequest {
  provider: Provider;
  subscriber: {
    ssn?: string;
    hicn?: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: 'M' | 'F';
  };
}

export interface SameOrSimilarRequest {
  payerCode: string;
  provider: Provider;
  subscriber: {
    mbi: string;
    firstName: string;
    lastName: string;
    dob: string;
  };
  hcpcsCodes: string[];
  doS_StartDate: string;
  doS_EndDate: string;
}

export interface ClaimStatusRequest {
  payerCode: string;
  provider: Provider;
  subscriber: Subscriber;
  claimStatusInquiry: {
    patientControlNumber?: string;
    payerClaimNumber?: string;
    serviceDate?: string;
    serviceDateEnd?: string;
  };
}

// ============================================
// Response Types
// ============================================

export interface APIResponse {
  apiResponseCode?: string;
  apiResponseMessage?: string;
  isSuccess?: boolean;
  requestId?: string;
}

export interface PlanCoverageSummary {
  status: string;
  effectiveDate: string;
  terminationDate?: string;
  planName: string;
  planNumber?: string;
  groupNumber?: string;
  groupName?: string;
  policyType?: string;
  insuranceType?: string;
  coverageLevel?: string;
}

export interface PCPAuthInfo {
  pcpName?: string;
  pcpPhone?: string;
  authRequired?: string;
  referralRequired?: string;
}

export interface CopayInfo {
  serviceType: string;
  copayAmount?: string;
  coinsurance?: string;
  networkType?: string;
}

export interface DeductibleInfo {
  individualDeductible?: string;
  individualDeductibleRemaining?: string;
  individualDeductibleUsed?: string;
  familyDeductible?: string;
  familyDeductibleRemaining?: string;
  familyDeductibleUsed?: string;
  individualOOP?: string;
  individualOOPRemaining?: string;
  individualOOPUsed?: string;
  familyOOP?: string;
  familyOOPRemaining?: string;
  familyOOPUsed?: string;
}

export interface EligibilitySummaryResponse extends APIResponse {
  isPayerBackOffice?: boolean;
  eligibilityStatus?: string;
  planCoverageSummary?: PlanCoverageSummary;
  pcpAuthInfoSummary?: PCPAuthInfo;
  copayDeductibleSummary?: DeductibleInfo & {
    copays?: CopayInfo[];
  };
  demographicInfo?: {
    subscriber?: {
      firstName?: string;
      lastName?: string;
      dob?: string;
      gender?: string;
      address1?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  };
  miscellaneousInfoSummary?: Record<string, string>;
  otherPayerInfoSummary?: Array<{
    payerName?: string;
    payerId?: string;
    coordinationOfBenefits?: string;
  }>;
}

export interface MBILookupResponse extends APIResponse {
  mbi?: string;
  mbiStatus?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
}

export interface MedicareAdvantageResponse extends APIResponse {
  hasMAplan?: boolean;
  maPlanName?: string;
  maPlanId?: string;
  maPayerCode?: string;
  maContractId?: string;
  maEffectiveDate?: string;
  maTerminationDate?: string;
}

export interface SameOrSimilarResponse extends APIResponse {
  items?: Array<{
    hcpcsCode?: string;
    serviceDate?: string;
    modifier?: string;
    providerNPI?: string;
    providerName?: string;
    quantity?: string;
  }>;
}

export interface ClaimStatusResponse extends APIResponse {
  claims?: Array<{
    claimNumber?: string;
    claimStatus?: string;
    statusCode?: string;
    statusDate?: string;
    totalClaimChargeAmount?: string;
    totalClaimPaymentAmount?: string;
    patientResponsibilityAmount?: string;
    serviceLines?: Array<{
      procedureCode?: string;
      serviceDate?: string;
      chargeAmount?: string;
      paymentAmount?: string;
      adjustmentAmount?: string;
    }>;
  }>;
}

// ============================================
// Payer Types
// ============================================

export interface Payer {
  payerCode: string;
  payerName: string;
  availableServices?: string[];
  isActive?: boolean;
  portalAvailability?: string;
  averageResponseTime?: string;
  payerType?: string;
}

export interface PayerListResponse extends APIResponse {
  payerList?: Payer[];
}

// ============================================
// Batch Types
// ============================================

export interface BatchEligibilityRequest {
  requests: EligibilityRequest[];
  callbackUrl?: string;
}

export interface BatchEligibilityResponse extends APIResponse {
  batchId?: string;
  status?: string;
  totalRequests?: number;
  completedRequests?: number;
  results?: EligibilitySummaryResponse[];
}

// ============================================
// Error Types
// ============================================

export interface PVerifyError {
  code: string;
  message: string;
  details?: string;
}

export const ErrorCodes: Record<string, PVerifyError> = {
  INVALID_PAYER: {
    code: 'INVALID_PAYER',
    message: 'Invalid Payer Code',
    details: 'The specified payer code is not valid. Use the Payer List operation to find valid codes.',
  },
  INVALID_NPI: {
    code: 'INVALID_NPI',
    message: 'Invalid NPI',
    details: 'Provider NPI must be a valid 10-digit number.',
  },
  PATIENT_NOT_FOUND: {
    code: 'PATIENT_NOT_FOUND',
    message: 'Patient Not Found',
    details: 'No eligibility record found. Verify member ID and date of birth.',
  },
  AUTH_FAILED: {
    code: 'AUTH_FAILED',
    message: 'Authentication Failed',
    details: 'Unable to authenticate with pVerify API. Check your credentials.',
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: 'Rate Limited',
    details: 'API rate limit exceeded. Please wait before retrying.',
  },
};

// ============================================
// Service Type Codes
// ============================================

export const ServiceTypeCodes: Record<string, string> = {
  '30': 'Health Benefit Plan Coverage',
  '33': 'Chiropractic',
  '47': 'Hospital',
  '48': 'Hospital - Inpatient',
  '50': 'Hospital - Outpatient',
  '86': 'Emergency Services',
  '88': 'Pharmacy',
  '98': 'Professional (Physician)',
  'UC': 'Urgent Care',
  'MH': 'Mental Health',
  'AL': 'Vision',
  'AJ': 'Dental',
  'A6': 'Psychiatric - Inpatient',
  'A7': 'Psychiatric - Outpatient',
  'A8': 'Substance Abuse - Inpatient',
  'A9': 'Substance Abuse - Outpatient',
  'BB': 'Physical Therapy',
  'BY': 'Speech Therapy',
  'BZ': 'Occupational Therapy',
};

// ============================================
// Relationship Codes
// ============================================

export const RelationshipCodes: Record<string, string> = {
  '18': 'Self',
  '01': 'Spouse',
  '19': 'Child',
  '20': 'Employee',
  '21': 'Unknown',
  '39': 'Organ Donor',
  '40': 'Cadaver Donor',
  '53': 'Life Partner',
  'G8': 'Other Relationship',
};
