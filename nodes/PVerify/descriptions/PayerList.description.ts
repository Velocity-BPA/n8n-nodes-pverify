/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const payerListOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['payerList'],
      },
    },
    options: [
      {
        name: 'Get All',
        value: 'getAll',
        description: 'Get complete list of supported payers',
        action: 'Get all payers',
      },
      {
        name: 'Search by Name',
        value: 'searchByName',
        description: 'Search payers by name',
        action: 'Search payers by name',
      },
      {
        name: 'Get by Code',
        value: 'getByCode',
        description: 'Get a specific payer by pVerify code',
        action: 'Get payer by code',
      },
    ],
    default: 'getAll',
  },
];

export const payerListFields: INodeProperties[] = [
  // Get All Options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['payerList'],
        operation: ['getAll'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: {
      minValue: 1,
      maxValue: 2000,
    },
    default: 100,
    description: 'Maximum number of payers to return',
    displayOptions: {
      show: {
        resource: ['payerList'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
  },

  // Search by Name
  {
    displayName: 'Payer Name',
    name: 'payerName',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'Aetna',
    description: 'Full or partial payer name to search',
    displayOptions: {
      show: {
        resource: ['payerList'],
        operation: ['searchByName'],
      },
    },
  },

  // Get by Code
  {
    displayName: 'Payer Code',
    name: 'payerCode',
    type: 'string',
    required: true,
    default: '',
    placeholder: '00001',
    description: 'pVerify payer code',
    displayOptions: {
      show: {
        resource: ['payerList'],
        operation: ['getByCode'],
      },
    },
  },

  // Filter Options for Get All
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['payerList'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Active Only',
        name: 'activeOnly',
        type: 'boolean',
        default: true,
        description: 'Whether to return only active payers',
      },
      {
        displayName: 'Payer Type',
        name: 'payerType',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'Commercial', value: 'Commercial' },
          { name: 'Medicare', value: 'Medicare' },
          { name: 'Medicaid', value: 'Medicaid' },
          { name: 'Workers Comp', value: 'WorkersComp' },
        ],
        default: '',
        description: 'Filter by payer type',
      },
      {
        displayName: 'Service Type',
        name: 'serviceType',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'Eligibility', value: 'Eligibility' },
          { name: 'Claim Status', value: 'ClaimStatus' },
          { name: 'Both', value: 'Both' },
        ],
        default: '',
        description: 'Filter by available services',
      },
    ],
  },
];
