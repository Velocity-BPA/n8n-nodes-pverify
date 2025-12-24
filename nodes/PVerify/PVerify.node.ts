/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
  JsonObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
  eligibilitySummaryOperations,
  eligibilitySummaryFields,
  eligibilityInquiryOperations,
  eligibilityInquiryFields,
  medicareOperations,
  medicareFields,
  claimStatusOperations,
  claimStatusFields,
  payerListOperations,
  payerListFields,
} from './descriptions';

import {
  pverifyApiRequest,
  buildEligibilityRequest,
  buildMedicareRequest,
  buildMBILookupRequest,
  buildSameOrSimilarRequest,
  buildClaimStatusRequest,
} from './transport';

export class PVerify implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'pVerify',
    name: 'pVerify',
    icon: 'file:pverify.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Verify patient insurance eligibility and benefits with pVerify',
    defaults: {
      name: 'pVerify',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'pVerifyApi',
        required: true,
      },
    ],
    properties: [
      // Resource Selection
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Eligibility Summary',
            value: 'eligibilitySummary',
            description: 'Quick eligibility check with summarized benefits',
          },
          {
            name: 'Eligibility Inquiry (Full)',
            value: 'eligibilityInquiry',
            description: 'Complete 271 response with all benefit details',
          },
          {
            name: 'Medicare',
            value: 'medicare',
            description: 'Medicare eligibility, MBI lookup, and MA discovery',
          },
          {
            name: 'Claim Status',
            value: 'claimStatus',
            description: 'Check status of submitted claims',
          },
          {
            name: 'Payer List',
            value: 'payerList',
            description: 'Get list of supported payers',
          },
        ],
        default: 'eligibilitySummary',
      },

      // Operations for each resource
      ...eligibilitySummaryOperations,
      ...eligibilityInquiryOperations,
      ...medicareOperations,
      ...claimStatusOperations,
      ...payerListOperations,

      // Fields for each resource/operation
      ...eligibilitySummaryFields,
      ...eligibilityInquiryFields,
      ...medicareFields,
      ...claimStatusFields,
      ...payerListFields,
    ],
  };

  methods = {
    loadOptions: {
      // Dynamic payer dropdown
      async getPayers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const response = await pverifyApiRequest(
            this,
            'GET',
            '/API/GetAllPayers',
            undefined,
            { maxResults: '1500' },
          );

          const payers = (response.PayerList || response.payerList || []) as Array<{
            PayerCode?: string;
            payerCode?: string;
            PayerName?: string;
            payerName?: string;
          }>;

          return payers.map((payer) => ({
            name: `${payer.PayerName || payer.payerName} (${payer.PayerCode || payer.payerCode})`,
            value: payer.PayerCode || payer.payerCode || '',
          }));
        } catch (error) {
          return [
            {
              name: 'Error loading payers - enter code manually',
              value: '',
            },
          ];
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: JsonObject;

        // ============================================
        // Eligibility Summary
        // ============================================
        if (resource === 'eligibilitySummary') {
          if (operation === 'verify') {
            const params = {
              payerCode: this.getNodeParameter('payerCode', i) as string,
              providerNpi: this.getNodeParameter('providerNpi', i) as string,
              providerFirstName: this.getNodeParameter('providerFirstName', i, '') as string,
              providerLastName: this.getNodeParameter('providerLastName', i, '') as string,
              subscriberMemberId: this.getNodeParameter('subscriberMemberId', i) as string,
              subscriberFirstName: this.getNodeParameter('subscriberFirstName', i) as string,
              subscriberLastName: this.getNodeParameter('subscriberLastName', i) as string,
              subscriberDob: this.getNodeParameter('subscriberDob', i) as string,
              subscriberGender: this.getNodeParameter('subscriberGender', i, 'U') as string,
              isSubscriberPatient: this.getNodeParameter('isSubscriberPatient', i, true) as boolean,
              dosStartDate: this.getNodeParameter('dosStartDate', i) as string,
              dosEndDate: this.getNodeParameter('dosEndDate', i) as string,
            };

            // Add dependent info if not subscriber patient
            if (!params.isSubscriberPatient) {
              Object.assign(params, {
                dependentFirstName: this.getNodeParameter('dependentFirstName', i, '') as string,
                dependentLastName: this.getNodeParameter('dependentLastName', i, '') as string,
                dependentDob: this.getNodeParameter('dependentDob', i, '') as string,
                dependentRelationship: this.getNodeParameter('dependentRelationship', i, '19') as string,
              });
            }

            // Add additional options
            const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
              practiceTypeCode?: string;
              referenceId?: string;
              location?: string;
              providerTaxonomyCode?: string;
              providerOrganizationName?: string;
            };
            Object.assign(params, additionalOptions);

            const requestBody = buildEligibilityRequest(params, true);
            responseData = await pverifyApiRequest(this, 'POST', '/API/EligibilitySummary', requestBody);
          } else {
            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
          }
        }

        // ============================================
        // Eligibility Inquiry (Full)
        // ============================================
        else if (resource === 'eligibilityInquiry') {
          if (operation === 'verify') {
            const params = {
              payerCode: this.getNodeParameter('payerCode', i) as string,
              providerNpi: this.getNodeParameter('providerNpi', i) as string,
              providerFirstName: this.getNodeParameter('providerFirstName', i, '') as string,
              providerLastName: this.getNodeParameter('providerLastName', i, '') as string,
              subscriberMemberId: this.getNodeParameter('subscriberMemberId', i) as string,
              subscriberFirstName: this.getNodeParameter('subscriberFirstName', i) as string,
              subscriberLastName: this.getNodeParameter('subscriberLastName', i) as string,
              subscriberDob: this.getNodeParameter('subscriberDob', i) as string,
              subscriberGender: this.getNodeParameter('subscriberGender', i, 'U') as string,
              isSubscriberPatient: this.getNodeParameter('isSubscriberPatient', i, true) as boolean,
              dosStartDate: this.getNodeParameter('dosStartDate', i) as string,
              dosEndDate: this.getNodeParameter('dosEndDate', i) as string,
            };

            if (!params.isSubscriberPatient) {
              Object.assign(params, {
                dependentFirstName: this.getNodeParameter('dependentFirstName', i, '') as string,
                dependentLastName: this.getNodeParameter('dependentLastName', i, '') as string,
                dependentDob: this.getNodeParameter('dependentDob', i, '') as string,
                dependentRelationship: this.getNodeParameter('dependentRelationship', i, '19') as string,
              });
            }

            const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as Record<string, unknown>;
            Object.assign(params, additionalOptions);

            const requestBody = buildEligibilityRequest(params, true);
            responseData = await pverifyApiRequest(this, 'POST', '/API/EligibilityInquiry', requestBody);
          } else {
            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
          }
        }

        // ============================================
        // Medicare Operations
        // ============================================
        else if (resource === 'medicare') {
          if (operation === 'verify') {
            const params = {
              payerCode: this.getNodeParameter('payerCode', i, '00007') as string,
              providerNpi: this.getNodeParameter('providerNpi', i) as string,
              providerFirstName: this.getNodeParameter('providerFirstName', i, '') as string,
              providerLastName: this.getNodeParameter('providerLastName', i, '') as string,
              subscriberMbi: this.getNodeParameter('subscriberMbi', i) as string,
              subscriberFirstName: this.getNodeParameter('subscriberFirstName', i) as string,
              subscriberLastName: this.getNodeParameter('subscriberLastName', i) as string,
              subscriberDob: this.getNodeParameter('subscriberDob', i) as string,
              dosStartDate: this.getNodeParameter('dosStartDate', i) as string,
              dosEndDate: this.getNodeParameter('dosEndDate', i) as string,
            };

            const requestBody = buildMedicareRequest(params);
            responseData = await pverifyApiRequest(this, 'POST', '/API/MedicareEligibility', requestBody);
          } else if (operation === 'mbiLookup') {
            const params = {
              providerNpi: this.getNodeParameter('providerNpi', i) as string,
              subscriberSsn: this.getNodeParameter('subscriberSsn', i, '') as string,
              subscriberHicn: this.getNodeParameter('subscriberHicn', i, '') as string,
              subscriberFirstName: this.getNodeParameter('subscriberFirstName', i) as string,
              subscriberLastName: this.getNodeParameter('subscriberLastName', i) as string,
              subscriberDob: this.getNodeParameter('subscriberDob', i) as string,
              subscriberGender: this.getNodeParameter('subscriberGender', i) as string,
            };

            const requestBody = buildMBILookupRequest(params);
            responseData = await pverifyApiRequest(this, 'POST', '/API/MBILookup', requestBody);
          } else if (operation === 'maDiscovery') {
            const params = {
              providerNpi: this.getNodeParameter('providerNpi', i) as string,
              providerFirstName: this.getNodeParameter('providerFirstName', i, '') as string,
              providerLastName: this.getNodeParameter('providerLastName', i, '') as string,
              subscriberMbi: this.getNodeParameter('subscriberMbi', i) as string,
              subscriberFirstName: this.getNodeParameter('subscriberFirstName', i) as string,
              subscriberLastName: this.getNodeParameter('subscriberLastName', i) as string,
              subscriberDob: this.getNodeParameter('subscriberDob', i) as string,
              dosStartDate: this.getNodeParameter('dosStartDate', i) as string,
              dosEndDate: this.getNodeParameter('dosEndDate', i) as string,
            };

            const requestBody = buildMedicareRequest(params);
            responseData = await pverifyApiRequest(this, 'POST', '/API/MedicareAdvantageDiscovery', requestBody);
          } else if (operation === 'sameOrSimilar') {
            const params = {
              payerCode: this.getNodeParameter('payerCode', i, '00007') as string,
              providerNpi: this.getNodeParameter('providerNpi', i) as string,
              subscriberMbi: this.getNodeParameter('subscriberMbi', i) as string,
              subscriberFirstName: this.getNodeParameter('subscriberFirstName', i) as string,
              subscriberLastName: this.getNodeParameter('subscriberLastName', i) as string,
              subscriberDob: this.getNodeParameter('subscriberDob', i) as string,
              hcpcsCodes: this.getNodeParameter('hcpcsCodes', i) as string,
              dosStartDate: this.getNodeParameter('dosStartDate', i) as string,
              dosEndDate: this.getNodeParameter('dosEndDate', i) as string,
            };

            const requestBody = buildSameOrSimilarRequest(params);
            responseData = await pverifyApiRequest(this, 'POST', '/API/SameOrSimilar', requestBody);
          } else {
            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
          }
        }

        // ============================================
        // Claim Status
        // ============================================
        else if (resource === 'claimStatus') {
          if (operation === 'check') {
            const searchBy = this.getNodeParameter('searchBy', i) as string;
            const params: Record<string, unknown> = {
              payerCode: this.getNodeParameter('payerCode', i) as string,
              providerNpi: this.getNodeParameter('providerNpi', i) as string,
              subscriberMemberId: this.getNodeParameter('subscriberMemberId', i) as string,
              subscriberFirstName: this.getNodeParameter('subscriberFirstName', i) as string,
              subscriberLastName: this.getNodeParameter('subscriberLastName', i) as string,
              subscriberDob: this.getNodeParameter('subscriberDob', i) as string,
            };

            if (searchBy === 'patientControlNumber') {
              params.patientControlNumber = this.getNodeParameter('patientControlNumber', i) as string;
            } else if (searchBy === 'payerClaimNumber') {
              params.payerClaimNumber = this.getNodeParameter('payerClaimNumber', i) as string;
            } else if (searchBy === 'serviceDate') {
              params.serviceDate = this.getNodeParameter('serviceDate', i) as string;
              params.serviceDateEnd = this.getNodeParameter('serviceDateEnd', i) as string;
            }

            const requestBody = buildClaimStatusRequest(params);
            responseData = await pverifyApiRequest(this, 'POST', '/API/ClaimStatus', requestBody);
          } else {
            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
          }
        }

        // ============================================
        // Payer List
        // ============================================
        else if (resource === 'payerList') {
          if (operation === 'getAll') {
            const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
            const limit = returnAll ? 2000 : (this.getNodeParameter('limit', i, 100) as number);
            const filters = this.getNodeParameter('filters', i, {}) as {
              activeOnly?: boolean;
              payerType?: string;
              serviceType?: string;
            };

            const query: Record<string, string> = {
              maxResults: limit.toString(),
            };

            if (filters.payerType) {
              query.payerType = filters.payerType;
            }

            responseData = await pverifyApiRequest(this, 'GET', '/API/GetAllPayers', undefined, query);

            // Filter active payers if requested
            if (filters.activeOnly && responseData.PayerList) {
              responseData.PayerList = (responseData.PayerList as Array<{ IsActive?: boolean }>).filter(
                (p) => p.IsActive !== false,
              );
            }
          } else if (operation === 'searchByName') {
            const payerName = this.getNodeParameter('payerName', i) as string;
            responseData = await pverifyApiRequest(
              this,
              'GET',
              '/API/GetPayerByName',
              undefined,
              { name: payerName },
            );
          } else if (operation === 'getByCode') {
            const payerCode = this.getNodeParameter('payerCode', i) as string;
            responseData = await pverifyApiRequest(
              this,
              'GET',
              '/API/GetPayerByCode',
              undefined,
              { code: payerCode },
            );
          } else {
            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
          }
        } else {
          throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        // Return the response data
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData),
          { itemData: { item: i } },
        );
        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
