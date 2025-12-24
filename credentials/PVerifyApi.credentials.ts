/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialDataDecryptedObject,
  ICredentialTestRequest,
  ICredentialType,
  IHttpRequestHelper,
  INodeProperties,
} from 'n8n-workflow';

export class PVerifyApi implements ICredentialType {
  name = 'pVerifyApi';
  displayName = 'pVerify API';
  documentationUrl = 'https://github.com/Velocity-BPA/n8n-nodes-pverify';

  properties: INodeProperties[] = [
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        {
          name: 'Sandbox',
          value: 'sandbox',
        },
        {
          name: 'Production',
          value: 'production',
        },
      ],
      default: 'sandbox',
      description: 'Select the pVerify API environment',
    },
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your pVerify API Client ID',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your pVerify API Client Secret',
    },
  ];

  // Token will be obtained dynamically, so we use a pre-request auth
  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.pverify.com',
      url: '/API/GetAllPayers',
      method: 'GET',
      qs: {
        maxResults: '1',
      },
    },
    rules: [
      {
        type: 'responseSuccessBody',
        properties: {
          key: 'PayerList',
          value: undefined,
          message: 'Invalid credentials - unable to authenticate with pVerify API',
        },
      },
    ],
  };
}
