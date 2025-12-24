/**
 * Transport Layer Tests
 * Tests for pVerify API communication utilities
 */

import {
  formatDate,
  parseDate,
  maskSensitiveData,
  buildEligibilityRequest,
  buildMedicareRequest,
  buildMBILookupRequest,
  buildSameOrSimilarRequest,
  buildClaimStatusRequest,
  getBaseUrl,
  clearTokenCache,
} from '../nodes/PVerify/transport';

describe('Transport Layer', () => {
  beforeEach(() => {
    clearTokenCache();
  });

  describe('getBaseUrl', () => {
    it('should return production URL', () => {
      expect(getBaseUrl('production')).toBe('https://api.pverify.com');
    });

    it('should return same URL for sandbox', () => {
      expect(getBaseUrl('sandbox')).toBe('https://api.pverify.com');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string to MM/DD/YYYY', () => {
      expect(formatDate('2024-03-15')).toBe('03/15/2024');
    });

    it('should format Date object to MM/DD/YYYY', () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      expect(formatDate(date)).toBe('03/15/2024');
    });

    it('should handle single digit months and days', () => {
      expect(formatDate('2024-01-05')).toBe('01/05/2024');
    });

    it('should throw error for invalid date', () => {
      expect(() => formatDate('invalid-date')).toThrow('Invalid date');
    });
  });

  describe('parseDate', () => {
    it('should parse MM/DD/YYYY to YYYY-MM-DD', () => {
      expect(parseDate('03/15/2024')).toBe('2024-03-15');
    });

    it('should handle single digit values', () => {
      expect(parseDate('1/5/2024')).toBe('2024-01-05');
    });

    it('should return empty string for empty input', () => {
      expect(parseDate('')).toBe('');
    });

    it('should return original string for invalid format', () => {
      expect(parseDate('2024-03-15')).toBe('2024-03-15');
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask SSN showing last 4 digits', () => {
      expect(maskSensitiveData('123456789', 4)).toBe('*****6789');
    });

    it('should mask member ID', () => {
      expect(maskSensitiveData('ABC123456789', 4)).toBe('********6789');
    });

    it('should return **** for short strings', () => {
      expect(maskSensitiveData('123', 4)).toBe('****');
    });

    it('should handle empty string', () => {
      expect(maskSensitiveData('')).toBe('****');
    });

    it('should handle custom visible characters', () => {
      expect(maskSensitiveData('1234567890', 2)).toBe('********90');
    });
  });

  describe('buildEligibilityRequest', () => {
    const baseParams = {
      payerCode: '00001',
      providerNpi: '1234567890',
      subscriberMemberId: 'MEM123',
      subscriberFirstName: 'John',
      subscriberLastName: 'Doe',
      subscriberDob: '1990-05-20',
      isSubscriberPatient: true,
      dosStartDate: '2024-03-15',
      dosEndDate: '2024-03-15',
    };

    it('should build basic eligibility request', () => {
      const request = buildEligibilityRequest(baseParams);

      expect(request.payerCode).toBe('00001');
      expect(request.provider).toEqual({ npi: '1234567890' });
      expect(request.subscriber).toEqual({
        memberId: 'MEM123',
        firstName: 'John',
        lastName: 'Doe',
        dob: '05/20/1990',
      });
      expect(request.isSubscriberPatient).toBe(true);
      expect(request.doS_StartDate).toBe('03/15/2024');
      expect(request.doS_EndDate).toBe('03/15/2024');
    });

    it('should include provider details when provided', () => {
      const params = {
        ...baseParams,
        providerFirstName: 'Jane',
        providerLastName: 'Smith',
        providerTaxonomyCode: '207Q00000X',
      };

      const request = buildEligibilityRequest(params);

      expect(request.provider).toEqual({
        npi: '1234567890',
        firstName: 'Jane',
        lastName: 'Smith',
        taxonomyCode: '207Q00000X',
      });
    });

    it('should include dependent when subscriber is not patient', () => {
      const params = {
        ...baseParams,
        isSubscriberPatient: false,
        dependentFirstName: 'Child',
        dependentLastName: 'Doe',
        dependentDob: '2015-08-10',
        dependentRelationship: '19',
      };

      const request = buildEligibilityRequest(params, true);

      expect(request.dependent).toEqual({
        firstName: 'Child',
        lastName: 'Doe',
        dob: '08/10/2015',
        relationship: '19',
      });
    });

    it('should include optional fields when provided', () => {
      const params = {
        ...baseParams,
        practiceTypeCode: 'PCP',
        referenceId: 'REF001',
        location: 'LOC1',
      };

      const request = buildEligibilityRequest(params);

      expect(request.practiceTypeCode).toBe('PCP');
      expect(request.referenceId).toBe('REF001');
      expect(request.location).toBe('LOC1');
    });

    it('should include subscriber gender when provided', () => {
      const params = {
        ...baseParams,
        subscriberGender: 'M',
      };

      const request = buildEligibilityRequest(params);
      expect((request.subscriber as { gender?: string }).gender).toBe('M');
    });
  });

  describe('buildMedicareRequest', () => {
    const baseParams = {
      payerCode: '00007',
      providerNpi: '1234567890',
      subscriberMbi: '1EG4-TE5-MK72',
      subscriberFirstName: 'Mary',
      subscriberLastName: 'Johnson',
      subscriberDob: '1950-12-01',
      dosStartDate: '2024-03-15',
      dosEndDate: '2024-03-15',
    };

    it('should build Medicare eligibility request', () => {
      const request = buildMedicareRequest(baseParams);

      expect(request.payerCode).toBe('00007');
      expect(request.provider).toEqual({ npi: '1234567890' });
      expect(request.subscriber).toEqual({
        mbi: '1EG4-TE5-MK72',
        firstName: 'Mary',
        lastName: 'Johnson',
        dob: '12/01/1950',
      });
      expect(request.doS_StartDate).toBe('03/15/2024');
      expect(request.doS_EndDate).toBe('03/15/2024');
    });

    it('should default to Medicare payer code', () => {
      const params = { ...baseParams };
      delete (params as { payerCode?: string }).payerCode;

      const request = buildMedicareRequest(params);
      expect(request.payerCode).toBe('00007');
    });
  });

  describe('buildMBILookupRequest', () => {
    it('should build MBI lookup request with SSN', () => {
      const params = {
        providerNpi: '1234567890',
        subscriberSsn: '1234',
        subscriberFirstName: 'Mary',
        subscriberLastName: 'Johnson',
        subscriberDob: '1950-12-01',
        subscriberGender: 'F',
      };

      const request = buildMBILookupRequest(params);

      expect(request.provider).toEqual({ npi: '1234567890' });
      expect(request.subscriber).toEqual({
        ssn: '1234',
        firstName: 'Mary',
        lastName: 'Johnson',
        dob: '12/01/1950',
        gender: 'F',
      });
    });

    it('should build MBI lookup request with HICN', () => {
      const params = {
        providerNpi: '1234567890',
        subscriberHicn: 'A12345678A',
        subscriberFirstName: 'Mary',
        subscriberLastName: 'Johnson',
        subscriberDob: '1950-12-01',
        subscriberGender: 'F',
      };

      const request = buildMBILookupRequest(params);

      expect((request.subscriber as { hicn?: string }).hicn).toBe('A12345678A');
    });
  });

  describe('buildSameOrSimilarRequest', () => {
    it('should build same or similar request with string codes', () => {
      const params = {
        payerCode: '00007',
        providerNpi: '1234567890',
        subscriberMbi: '1EG4-TE5-MK72',
        subscriberFirstName: 'Mary',
        subscriberLastName: 'Johnson',
        subscriberDob: '1950-12-01',
        hcpcsCodes: 'E0601, E0470, A7030',
        dosStartDate: '2024-03-15',
        dosEndDate: '2024-03-15',
      };

      const request = buildSameOrSimilarRequest(params);

      expect(request.hcpcsCodes).toEqual(['E0601', 'E0470', 'A7030']);
    });

    it('should handle array of codes', () => {
      const params = {
        payerCode: '00007',
        providerNpi: '1234567890',
        subscriberMbi: '1EG4-TE5-MK72',
        subscriberFirstName: 'Mary',
        subscriberLastName: 'Johnson',
        subscriberDob: '1950-12-01',
        hcpcsCodes: ['E0601', 'E0470'],
        dosStartDate: '2024-03-15',
        dosEndDate: '2024-03-15',
      };

      const request = buildSameOrSimilarRequest(params);

      expect(request.hcpcsCodes).toEqual(['E0601', 'E0470']);
    });
  });

  describe('buildClaimStatusRequest', () => {
    it('should build claim status request', () => {
      const params = {
        payerCode: '00001',
        providerNpi: '1234567890',
        subscriberMemberId: 'MEM123',
        subscriberFirstName: 'John',
        subscriberLastName: 'Doe',
        subscriberDob: '1990-05-20',
        patientControlNumber: 'PCN001',
      };

      const request = buildClaimStatusRequest(params);

      expect(request.payerCode).toBe('00001');
      expect(request.provider).toEqual({ npi: '1234567890' });
      expect((request.claimStatusInquiry as { patientControlNumber?: string }).patientControlNumber).toBe('PCN001');
    });

    it('should include service date range when provided', () => {
      const params = {
        payerCode: '00001',
        providerNpi: '1234567890',
        subscriberMemberId: 'MEM123',
        subscriberFirstName: 'John',
        subscriberLastName: 'Doe',
        subscriberDob: '1990-05-20',
        serviceDate: '2024-01-01',
        serviceDateEnd: '2024-03-31',
      };

      const request = buildClaimStatusRequest(params);

      expect((request.claimStatusInquiry as { serviceDate?: string }).serviceDate).toBe('01/01/2024');
      expect((request.claimStatusInquiry as { serviceDateEnd?: string }).serviceDateEnd).toBe('03/31/2024');
    });
  });
});
