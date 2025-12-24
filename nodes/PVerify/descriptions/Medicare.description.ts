/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const medicareOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['medicare'],
      },
    },
    options: [
      {
        name: 'Verify Eligibility',
        value: 'verify',
        description: 'Verify Medicare Part A & B eligibility',
        action: 'Verify medicare eligibility',
      },
      {
        name: 'MBI Lookup',
        value: 'mbiLookup',
        description: 'Find a patient\'s Medicare Beneficiary Identifier',
        action: 'Lookup mbi',
      },
      {
        name: 'Medicare Advantage Discovery',
        value: 'maDiscovery',
        description: 'Discover if patient has a Medicare Advantage plan',
        action: 'Discover medicare advantage plan',
      },
      {
        name: 'Same or Similar',
        value: 'sameOrSimilar',
        description: 'Check for same or similar services history',
        action: 'Check same or similar services',
      },
    ],
    default: 'verify',
  },
];

export const medicareFields: INodeProperties[] = [
  // ============================================
  // Medicare Eligibility Verify Fields
  // ============================================
  {
    displayName: 'Provider NPI',
    name: 'providerNpi',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1234567890',
    description: '10-digit National Provider Identifier',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['verify', 'mbiLookup', 'maDiscovery', 'sameOrSimilar'],
      },
    },
  },
  {
    displayName: 'Provider First Name',
    name: 'providerFirstName',
    type: 'string',
    default: '',
    description: 'Provider first name (optional)',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['verify', 'maDiscovery'],
      },
    },
  },
  {
    displayName: 'Provider Last Name',
    name: 'providerLastName',
    type: 'string',
    default: '',
    description: 'Provider last name (optional)',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['verify', 'maDiscovery'],
      },
    },
  },

  // MBI field for Medicare operations
  {
    displayName: 'Medicare Beneficiary Identifier (MBI)',
    name: 'subscriberMbi',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1EG4-TE5-MK72',
    description: '11-character Medicare Beneficiary Identifier',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['verify', 'maDiscovery', 'sameOrSimilar'],
      },
    },
  },

  // Subscriber info for all Medicare operations
  {
    displayName: 'Subscriber First Name',
    name: 'subscriberFirstName',
    type: 'string',
    required: true,
    default: '',
    description: 'Patient\'s first name',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['verify', 'mbiLookup', 'maDiscovery', 'sameOrSimilar'],
      },
    },
  },
  {
    displayName: 'Subscriber Last Name',
    name: 'subscriberLastName',
    type: 'string',
    required: true,
    default: '',
    description: 'Patient\'s last name',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['verify', 'mbiLookup', 'maDiscovery', 'sameOrSimilar'],
      },
    },
  },
  {
    displayName: 'Subscriber Date of Birth',
    name: 'subscriberDob',
    type: 'dateTime',
    required: true,
    default: '',
    description: 'Patient\'s date of birth',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['verify', 'mbiLookup', 'maDiscovery', 'sameOrSimilar'],
      },
    },
  },

  // ============================================
  // MBI Lookup Specific Fields
  // ============================================
  {
    displayName: 'SSN (Last 4 or Full)',
    name: 'subscriberSsn',
    type: 'string',
    default: '',
    description: 'Social Security Number (last 4 digits or full). Either SSN or old HICN is recommended.',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['mbiLookup'],
      },
    },
  },
  {
    displayName: 'Old HICN',
    name: 'subscriberHicn',
    type: 'string',
    default: '',
    description: 'Old Health Insurance Claim Number if known',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['mbiLookup'],
      },
    },
  },
  {
    displayName: 'Subscriber Gender',
    name: 'subscriberGender',
    type: 'options',
    required: true,
    options: [
      { name: 'Male', value: 'M' },
      { name: 'Female', value: 'F' },
    ],
    default: 'M',
    description: 'Patient\'s gender (required for MBI lookup)',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['mbiLookup'],
      },
    },
  },

  // ============================================
  // Same or Similar Specific Fields
  // ============================================
  {
    displayName: 'HCPCS Codes',
    name: 'hcpcsCodes',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'E0601, E0470, A7030',
    description: 'Comma-separated list of HCPCS codes to check for same/similar history',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['sameOrSimilar'],
      },
    },
  },

  // ============================================
  // Date of Service Fields
  // ============================================
  {
    displayName: 'Date of Service Start',
    name: 'dosStartDate',
    type: 'dateTime',
    required: true,
    default: '',
    description: 'Start date of service',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['verify', 'maDiscovery', 'sameOrSimilar'],
      },
    },
  },
  {
    displayName: 'Date of Service End',
    name: 'dosEndDate',
    type: 'dateTime',
    required: true,
    default: '',
    description: 'End date of service',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['verify', 'maDiscovery', 'sameOrSimilar'],
      },
    },
  },

  // ============================================
  // Additional Options
  // ============================================
  {
    displayName: 'Payer Code Override',
    name: 'payerCode',
    type: 'string',
    default: '00007',
    description: 'Medicare payer code (default: 00007 for Medicare Part A & B)',
    displayOptions: {
      show: {
        resource: ['medicare'],
        operation: ['verify', 'sameOrSimilar'],
      },
    },
  },
];
