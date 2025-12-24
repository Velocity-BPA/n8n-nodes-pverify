/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * pVerify API Transport Layer
 * Handles authentication, token management, and API requests
 */

import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IHookFunctions,
  IHttpRequestMethods,
  IRequestOptions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import type { PVerifyCredentials, TokenCache, TokenResponse } from '../types';

// Token cache for reuse within execution
const tokenCache: Map<string, TokenCache> = new Map();

/**
 * Get the base URL for the pVerify API
 */
export function getBaseUrl(environment: string): string {
  // Both sandbox and production use the same URL
  // Sandbox is determined by credentials, not URL
  return 'https://api.pverify.com';
}

/**
 * Generate a cache key for token storage
 */
function getTokenCacheKey(credentials: PVerifyCredentials): string {
  return `${credentials.clientId}_${credentials.environment}`;
}

/**
 * Request a new OAuth2 token from pVerify
 */
async function requestToken(
  context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
  credentials: PVerifyCredentials,
): Promise<TokenResponse> {
  const baseUrl = getBaseUrl(credentials.environment);

  const options: IRequestOptions = {
    method: 'POST' as IHttpRequestMethods,
    uri: `${baseUrl}/Token`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(credentials.clientId)}&client_secret=${encodeURIComponent(credentials.clientSecret)}`,
    json: true,
  };

  try {
    const response = await context.helpers.request(options);
    return response as TokenResponse;
  } catch (error) {
    throw new NodeApiError(context.getNode(), error as JsonObject, {
      message: 'Failed to authenticate with pVerify API',
      description: 'Check your Client ID and Client Secret credentials.',
    });
  }
}

/**
 * Get a valid access token, using cache if available
 */
export async function getAccessToken(
  context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
  credentials: PVerifyCredentials,
): Promise<string> {
  const cacheKey = getTokenCacheKey(credentials);
  const cached = tokenCache.get(cacheKey);

  // Return cached token if still valid (with 60-second buffer)
  if (cached && Date.now() < cached.expiresAt - 60000) {
    return cached.token;
  }

  // Request new token
  const tokenResponse = await requestToken(context, credentials);

  // Cache the new token
  const newCache: TokenCache = {
    token: tokenResponse.access_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
  };
  tokenCache.set(cacheKey, newCache);

  return newCache.token;
}

/**
 * Clear the token cache (useful for testing or credential changes)
 */
export function clearTokenCache(): void {
  tokenCache.clear();
}

/**
 * Format a date to pVerify's expected format (MM/DD/YYYY)
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }

  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();

  return `${month}/${day}/${year}`;
}

/**
 * Parse pVerify date format (MM/DD/YYYY) to ISO string
 */
export function parseDate(pverifyDate: string): string {
  if (!pverifyDate) return '';

  const parts = pverifyDate.split('/');
  if (parts.length !== 3) return pverifyDate;

  const [month, day, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return '****';
  return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
}

/**
 * Make an authenticated API request to pVerify
 */
export async function pverifyApiRequest(
  context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: object,
  query?: Record<string, string>,
): Promise<JsonObject> {
  const credentials = (await context.getCredentials('pVerifyApi')) as unknown as PVerifyCredentials;

  const token = await getAccessToken(context, credentials);
  const baseUrl = getBaseUrl(credentials.environment);

  const options: IRequestOptions = {
    method,
    uri: `${baseUrl}${endpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    json: true,
  };

  if (body && Object.keys(body).length > 0) {
    options.body = body;
  }

  if (query && Object.keys(query).length > 0) {
    options.qs = query;
  }

  try {
    const response = await context.helpers.request(options);

    // Check for API-level errors in response body
    if (response && response.APIResponseCode && response.APIResponseCode !== '0') {
      throw new NodeApiError(context.getNode(), response as JsonObject, {
        message: response.APIResponseMessage || 'pVerify API Error',
        description: mapErrorMessage(response.APIResponseMessage),
      });
    }

    return response as JsonObject;
  } catch (error) {
    // Handle HTTP errors
    const nodeError = error as NodeApiError;
    if (nodeError.httpCode !== undefined) {
      if (String(nodeError.httpCode) === '401') {
        // Clear token cache and retry once
        clearTokenCache();
        throw new NodeApiError(context.getNode(), error as JsonObject, {
          message: 'Authentication failed',
          description: 'Your pVerify credentials may be invalid or expired.',
        });
      }
      if (String(nodeError.httpCode) === '429') {
        throw new NodeApiError(context.getNode(), error as JsonObject, {
          message: 'Rate limit exceeded',
          description: 'Please wait before making more requests to the pVerify API.',
        });
      }
    }

    throw error;
  }
}

/**
 * Map common pVerify error messages to helpful descriptions
 */
function mapErrorMessage(message?: string): string {
  if (!message) return 'An unknown error occurred.';

  const errorMappings: Record<string, string> = {
    'Invalid Payer Code': 'The payer code is not valid. Use the "Get All Payers" operation to find valid payer codes.',
    'Invalid NPI': 'The Provider NPI must be a valid 10-digit number.',
    'Patient Not Found': 'No eligibility record found. Please verify the member ID, date of birth, and payer code.',
    'Invalid Member ID': 'The member ID format is incorrect for this payer.',
    'Invalid Date Format': 'Dates must be in MM/DD/YYYY format.',
    'Service Unavailable': 'The payer system is temporarily unavailable. Please try again later.',
    'Payer Timeout': 'The payer did not respond in time. Please try again.',
  };

  for (const [key, value] of Object.entries(errorMappings)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return message;
}

/**
 * Build an eligibility request body from node parameters
 */
export function buildEligibilityRequest(
  params: Record<string, unknown>,
  includeDependent: boolean = false,
): Record<string, unknown> {
  // Build provider object
  const provider: Record<string, unknown> = {
    npi: params.providerNpi,
  };
  if (params.providerFirstName) provider.firstName = params.providerFirstName;
  if (params.providerLastName) provider.lastName = params.providerLastName;
  if (params.providerTaxonomyCode) provider.taxonomyCode = params.providerTaxonomyCode;
  if (params.providerOrganizationName) provider.organizationName = params.providerOrganizationName;

  // Build subscriber object
  const subscriber: Record<string, unknown> = {
    memberId: params.subscriberMemberId,
    firstName: params.subscriberFirstName,
    lastName: params.subscriberLastName,
    dob: formatDate(params.subscriberDob as string),
  };
  if (params.subscriberGender) subscriber.gender = params.subscriberGender;

  const request: Record<string, unknown> = {
    payerCode: params.payerCode,
    provider,
    subscriber,
    isSubscriberPatient: params.isSubscriberPatient ?? true,
    doS_StartDate: formatDate(params.dosStartDate as string),
    doS_EndDate: formatDate(params.dosEndDate as string),
  };

  // Add optional fields
  if (params.practiceTypeCode) {
    request.practiceTypeCode = params.practiceTypeCode;
  }
  if (params.referenceId) {
    request.referenceId = params.referenceId;
  }
  if (params.location) {
    request.location = params.location;
  }

  // Add dependent if not subscriber patient and dependent info provided
  if (includeDependent && !params.isSubscriberPatient && params.dependentFirstName) {
    const dependent: Record<string, unknown> = {
      firstName: params.dependentFirstName,
      lastName: params.dependentLastName,
      dob: formatDate(params.dependentDob as string),
      relationship: params.dependentRelationship || '19', // Default to Child
    };
    if (params.dependentGender) dependent.gender = params.dependentGender;
    request.dependent = dependent;
  }

  return request;
}

/**
 * Build a Medicare eligibility request body
 */
export function buildMedicareRequest(params: Record<string, unknown>): Record<string, unknown> {
  // Build provider object
  const provider: Record<string, unknown> = {
    npi: params.providerNpi,
  };
  if (params.providerFirstName) provider.firstName = params.providerFirstName;
  if (params.providerLastName) provider.lastName = params.providerLastName;

  return {
    payerCode: params.payerCode || '00007', // Medicare default
    provider,
    subscriber: {
      mbi: params.subscriberMbi,
      firstName: params.subscriberFirstName,
      lastName: params.subscriberLastName,
      dob: formatDate(params.subscriberDob as string),
    },
    doS_StartDate: formatDate(params.dosStartDate as string),
    doS_EndDate: formatDate(params.dosEndDate as string),
  };
}

/**
 * Build an MBI lookup request body
 */
export function buildMBILookupRequest(params: Record<string, unknown>): Record<string, unknown> {
  const subscriber: Record<string, unknown> = {
    firstName: params.subscriberFirstName,
    lastName: params.subscriberLastName,
    dob: formatDate(params.subscriberDob as string),
    gender: params.subscriberGender,
  };
  if (params.subscriberSsn) subscriber.ssn = params.subscriberSsn;
  if (params.subscriberHicn) subscriber.hicn = params.subscriberHicn;

  return {
    provider: {
      npi: params.providerNpi,
    },
    subscriber,
  };
}

/**
 * Build a Same or Similar request body
 */
export function buildSameOrSimilarRequest(params: Record<string, unknown>): Record<string, unknown> {
  const hcpcsCodes = typeof params.hcpcsCodes === 'string'
    ? (params.hcpcsCodes as string).split(',').map(code => code.trim())
    : params.hcpcsCodes;

  return {
    payerCode: params.payerCode || '00007',
    provider: {
      npi: params.providerNpi,
    },
    subscriber: {
      mbi: params.subscriberMbi,
      firstName: params.subscriberFirstName,
      lastName: params.subscriberLastName,
      dob: formatDate(params.subscriberDob as string),
    },
    hcpcsCodes,
    doS_StartDate: formatDate(params.dosStartDate as string),
    doS_EndDate: formatDate(params.dosEndDate as string),
  };
}

/**
 * Build a Claim Status request body
 */
export function buildClaimStatusRequest(params: Record<string, unknown>): Record<string, unknown> {
  const claimStatusInquiry: Record<string, unknown> = {};
  if (params.patientControlNumber) claimStatusInquiry.patientControlNumber = params.patientControlNumber;
  if (params.payerClaimNumber) claimStatusInquiry.payerClaimNumber = params.payerClaimNumber;
  if (params.serviceDate) claimStatusInquiry.serviceDate = formatDate(params.serviceDate as string);
  if (params.serviceDateEnd) claimStatusInquiry.serviceDateEnd = formatDate(params.serviceDateEnd as string);

  return {
    payerCode: params.payerCode,
    provider: {
      npi: params.providerNpi,
    },
    subscriber: {
      memberId: params.subscriberMemberId,
      firstName: params.subscriberFirstName,
      lastName: params.subscriberLastName,
      dob: formatDate(params.subscriberDob as string),
    },
    claimStatusInquiry,
  };
}
