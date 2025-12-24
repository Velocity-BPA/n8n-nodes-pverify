/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const claimStatusOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['claimStatus'],
      },
    },
    options: [
      {
        name: 'Check Status',
        value: 'check',
        description: 'Check the status of a submitted claim',
        action: 'Check claim status',
      },
    ],
    default: 'check',
  },
];

export const claimStatusFields: INodeProperties[] = [
  // Payer Information
  {
    displayName: 'Payer Code',
    name: 'payerCode',
    type: 'string',
    required: true,
    default: '',
    placeholder: '00001',
    description: 'pVerify Payer ID',
    displayOptions: {
      show: {
        resource: ['claimStatus'],
        operation: ['check'],
      },
    },
  },

  // Provider Information
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
        resource: ['claimStatus'],
        operation: ['check'],
      },
    },
  },

  // Subscriber Information
  {
    displayName: 'Subscriber Member ID',
    name: 'subscriberMemberId',
    type: 'string',
    required: true,
    default: '',
    description: 'Insurance member ID',
    displayOptions: {
      show: {
        resource: ['claimStatus'],
        operation: ['check'],
      },
    },
  },
  {
    displayName: 'Subscriber First Name',
    name: 'subscriberFirstName',
    type: 'string',
    required: true,
    default: '',
    description: 'Subscriber\'s first name',
    displayOptions: {
      show: {
        resource: ['claimStatus'],
        operation: ['check'],
      },
    },
  },
  {
    displayName: 'Subscriber Last Name',
    name: 'subscriberLastName',
    type: 'string',
    required: true,
    default: '',
    description: 'Subscriber\'s last name',
    displayOptions: {
      show: {
        resource: ['claimStatus'],
        operation: ['check'],
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
        resource: ['claimStatus'],
        operation: ['check'],
      },
    },
  },

  // Claim Search Criteria
  {
    displayName: 'Search By',
    name: 'searchBy',
    type: 'options',
    options: [
      {
        name: 'Patient Control Number',
        value: 'patientControlNumber',
        description: 'Your internal claim/patient control number',
      },
      {
        name: 'Payer Claim Number',
        value: 'payerClaimNumber',
        description: 'The payer\'s claim reference number',
      },
      {
        name: 'Service Date Range',
        value: 'serviceDate',
        description: 'Search by date of service',
      },
    ],
    default: 'patientControlNumber',
    description: 'How to identify the claim',
    displayOptions: {
      show: {
        resource: ['claimStatus'],
        operation: ['check'],
      },
    },
  },

  // Patient Control Number
  {
    displayName: 'Patient Control Number',
    name: 'patientControlNumber',
    type: 'string',
    default: '',
    description: 'Your internal claim or patient control number',
    displayOptions: {
      show: {
        resource: ['claimStatus'],
        operation: ['check'],
        searchBy: ['patientControlNumber'],
      },
    },
  },

  // Payer Claim Number
  {
    displayName: 'Payer Claim Number',
    name: 'payerClaimNumber',
    type: 'string',
    default: '',
    description: 'The payer\'s claim reference number',
    displayOptions: {
      show: {
        resource: ['claimStatus'],
        operation: ['check'],
        searchBy: ['payerClaimNumber'],
      },
    },
  },

  // Service Date Range
  {
    displayName: 'Service Date Start',
    name: 'serviceDate',
    type: 'dateTime',
    default: '',
    description: 'Start date of service to search',
    displayOptions: {
      show: {
        resource: ['claimStatus'],
        operation: ['check'],
        searchBy: ['serviceDate'],
      },
    },
  },
  {
    displayName: 'Service Date End',
    name: 'serviceDateEnd',
    type: 'dateTime',
    default: '',
    description: 'End date of service to search',
    displayOptions: {
      show: {
        resource: ['claimStatus'],
        operation: ['check'],
        searchBy: ['serviceDate'],
      },
    },
  },
];
