/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const eligibilitySummaryOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
      },
    },
    options: [
      {
        name: 'Verify',
        value: 'verify',
        description: 'Get a high-level summary of patient eligibility and benefits',
        action: 'Verify eligibility summary',
      },
    ],
    default: 'verify',
  },
];

export const eligibilitySummaryFields: INodeProperties[] = [
  // ============================================
  // Payer Information
  // ============================================
  {
    displayName: 'Payer Code',
    name: 'payerCode',
    type: 'string',
    required: true,
    default: '',
    placeholder: '00001',
    description: 'pVerify Payer ID (e.g., 00001 for Aetna). Use the Payer List operation to find codes.',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
      },
    },
  },

  // ============================================
  // Provider Information
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
        resource: ['eligibilitySummary'],
        operation: ['verify'],
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
        resource: ['eligibilitySummary'],
        operation: ['verify'],
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
        resource: ['eligibilitySummary'],
        operation: ['verify'],
      },
    },
  },

  // ============================================
  // Subscriber Information
  // ============================================
  {
    displayName: 'Subscriber Member ID',
    name: 'subscriberMemberId',
    type: 'string',
    required: true,
    default: '',
    description: 'Insurance member ID from the patient\'s insurance card',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
      },
    },
  },
  {
    displayName: 'Subscriber First Name',
    name: 'subscriberFirstName',
    type: 'string',
    required: true,
    default: '',
    description: 'Subscriber\'s first name as shown on insurance card',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
      },
    },
  },
  {
    displayName: 'Subscriber Last Name',
    name: 'subscriberLastName',
    type: 'string',
    required: true,
    default: '',
    description: 'Subscriber\'s last name as shown on insurance card',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
      },
    },
  },
  {
    displayName: 'Subscriber Date of Birth',
    name: 'subscriberDob',
    type: 'dateTime',
    required: true,
    default: '',
    description: 'Subscriber\'s date of birth',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
      },
    },
  },
  {
    displayName: 'Subscriber Gender',
    name: 'subscriberGender',
    type: 'options',
    options: [
      { name: 'Male', value: 'M' },
      { name: 'Female', value: 'F' },
      { name: 'Unknown', value: 'U' },
    ],
    default: 'U',
    description: 'Subscriber\'s gender',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
      },
    },
  },

  // ============================================
  // Patient Information
  // ============================================
  {
    displayName: 'Is Subscriber the Patient?',
    name: 'isSubscriberPatient',
    type: 'boolean',
    default: true,
    description: 'Whether the subscriber is the patient receiving services',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
      },
    },
  },

  // ============================================
  // Dependent Information (shown when subscriber is not patient)
  // ============================================
  {
    displayName: 'Dependent First Name',
    name: 'dependentFirstName',
    type: 'string',
    default: '',
    description: 'Dependent patient\'s first name',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
        isSubscriberPatient: [false],
      },
    },
  },
  {
    displayName: 'Dependent Last Name',
    name: 'dependentLastName',
    type: 'string',
    default: '',
    description: 'Dependent patient\'s last name',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
        isSubscriberPatient: [false],
      },
    },
  },
  {
    displayName: 'Dependent Date of Birth',
    name: 'dependentDob',
    type: 'dateTime',
    default: '',
    description: 'Dependent patient\'s date of birth',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
        isSubscriberPatient: [false],
      },
    },
  },
  {
    displayName: 'Dependent Relationship',
    name: 'dependentRelationship',
    type: 'options',
    options: [
      { name: 'Spouse', value: '01' },
      { name: 'Child', value: '19' },
      { name: 'Employee', value: '20' },
      { name: 'Life Partner', value: '53' },
      { name: 'Other', value: 'G8' },
    ],
    default: '19',
    description: 'Relationship of dependent to subscriber',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
        isSubscriberPatient: [false],
      },
    },
  },

  // ============================================
  // Date of Service
  // ============================================
  {
    displayName: 'Date of Service Start',
    name: 'dosStartDate',
    type: 'dateTime',
    required: true,
    default: '',
    description: 'Start date of service for eligibility check',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
      },
    },
  },
  {
    displayName: 'Date of Service End',
    name: 'dosEndDate',
    type: 'dateTime',
    required: true,
    default: '',
    description: 'End date of service for eligibility check (can be same as start date)',
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
      },
    },
  },

  // ============================================
  // Additional Options
  // ============================================
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['eligibilitySummary'],
        operation: ['verify'],
      },
    },
    options: [
      {
        displayName: 'Practice Type Code',
        name: 'practiceTypeCode',
        type: 'string',
        default: '',
        description: 'Optional practice type code for specific benefit categories',
      },
      {
        displayName: 'Reference ID',
        name: 'referenceId',
        type: 'string',
        default: '',
        description: 'Your internal reference ID for tracking',
      },
      {
        displayName: 'Location',
        name: 'location',
        type: 'string',
        default: '',
        description: 'Location identifier for multi-location practices',
      },
      {
        displayName: 'Provider Taxonomy Code',
        name: 'providerTaxonomyCode',
        type: 'string',
        default: '',
        description: 'Provider specialty taxonomy code',
      },
      {
        displayName: 'Provider Organization Name',
        name: 'providerOrganizationName',
        type: 'string',
        default: '',
        description: 'Organization name for organizational NPIs',
      },
    ],
  },
];
