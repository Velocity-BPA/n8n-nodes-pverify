/**
 * Node Description Tests
 * Tests for pVerify node property definitions
 */

import { PVerify } from '../nodes/PVerify/PVerify.node';

describe('PVerify Node', () => {
  let node: PVerify;

  beforeAll(() => {
    node = new PVerify();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(node.description.displayName).toBe('pVerify');
    });

    it('should have correct name', () => {
      expect(node.description.name).toBe('pVerify');
    });

    it('should have proper description', () => {
      expect(node.description.description).toContain('eligibility');
      expect(node.description.description).toContain('pVerify');
    });

    it('should require pVerifyApi credentials', () => {
      expect(node.description.credentials).toEqual([
        {
          name: 'pVerifyApi',
          required: true,
        },
      ]);
    });

    it('should have icon file reference', () => {
      expect(node.description.icon).toBe('file:pverify.svg');
    });
  });

  describe('Resources', () => {
    it('should have all expected resources', () => {
      const resourceProperty = node.description.properties.find(
        (p) => p.name === 'resource'
      );
      expect(resourceProperty).toBeDefined();

      const options = (resourceProperty as { options?: Array<{ value: string }> })?.options;
      expect(options).toBeDefined();

      const resourceValues = options?.map((o) => o.value);
      expect(resourceValues).toContain('eligibilitySummary');
      expect(resourceValues).toContain('eligibilityInquiry');
      expect(resourceValues).toContain('medicare');
      expect(resourceValues).toContain('claimStatus');
      expect(resourceValues).toContain('payerList');
    });
  });

  describe('Eligibility Summary Fields', () => {
    it('should have payer code field', () => {
      const payerCodeField = node.description.properties.find(
        (p) => p.name === 'payerCode' && 
        p.displayOptions?.show?.resource?.includes('eligibilitySummary')
      );
      expect(payerCodeField).toBeDefined();
      expect(payerCodeField?.required).toBe(true);
    });

    it('should have provider NPI field', () => {
      const npiField = node.description.properties.find(
        (p) => p.name === 'providerNpi' && 
        p.displayOptions?.show?.resource?.includes('eligibilitySummary')
      );
      expect(npiField).toBeDefined();
      expect(npiField?.required).toBe(true);
    });

    it('should have subscriber fields', () => {
      const subscriberFirstName = node.description.properties.find(
        (p) => p.name === 'subscriberFirstName' && 
        p.displayOptions?.show?.resource?.includes('eligibilitySummary')
      );
      const subscriberLastName = node.description.properties.find(
        (p) => p.name === 'subscriberLastName' && 
        p.displayOptions?.show?.resource?.includes('eligibilitySummary')
      );
      const subscriberDob = node.description.properties.find(
        (p) => p.name === 'subscriberDob' && 
        p.displayOptions?.show?.resource?.includes('eligibilitySummary')
      );

      expect(subscriberFirstName).toBeDefined();
      expect(subscriberLastName).toBeDefined();
      expect(subscriberDob).toBeDefined();
    });

    it('should have date of service fields', () => {
      const dosStart = node.description.properties.find(
        (p) => p.name === 'dosStartDate' && 
        p.displayOptions?.show?.resource?.includes('eligibilitySummary')
      );
      const dosEnd = node.description.properties.find(
        (p) => p.name === 'dosEndDate' && 
        p.displayOptions?.show?.resource?.includes('eligibilitySummary')
      );

      expect(dosStart).toBeDefined();
      expect(dosEnd).toBeDefined();
      expect(dosStart?.type).toBe('dateTime');
      expect(dosEnd?.type).toBe('dateTime');
    });

    it('should have dependent fields with conditional display', () => {
      const dependentFirstName = node.description.properties.find(
        (p) => p.name === 'dependentFirstName'
      );

      expect(dependentFirstName).toBeDefined();
      expect(dependentFirstName?.displayOptions?.show?.isSubscriberPatient).toEqual([false]);
    });
  });

  describe('Medicare Fields', () => {
    it('should have MBI field for Medicare verify', () => {
      const mbiField = node.description.properties.find(
        (p) => p.name === 'subscriberMbi' && 
        p.displayOptions?.show?.resource?.includes('medicare')
      );
      expect(mbiField).toBeDefined();
      expect(mbiField?.required).toBe(true);
    });

    it('should have HCPCS codes field for same/similar', () => {
      const hcpcsField = node.description.properties.find(
        (p) => p.name === 'hcpcsCodes'
      );
      expect(hcpcsField).toBeDefined();
      expect(hcpcsField?.displayOptions?.show?.operation).toContain('sameOrSimilar');
    });

    it('should have SSN field for MBI lookup', () => {
      const ssnField = node.description.properties.find(
        (p) => p.name === 'subscriberSsn'
      );
      expect(ssnField).toBeDefined();
      expect(ssnField?.displayOptions?.show?.operation).toContain('mbiLookup');
    });
  });

  describe('Payer List Fields', () => {
    it('should have return all option', () => {
      const returnAllField = node.description.properties.find(
        (p) => p.name === 'returnAll' && 
        p.displayOptions?.show?.resource?.includes('payerList')
      );
      expect(returnAllField).toBeDefined();
      expect(returnAllField?.type).toBe('boolean');
    });

    it('should have limit field', () => {
      const limitField = node.description.properties.find(
        (p) => p.name === 'limit' && 
        p.displayOptions?.show?.resource?.includes('payerList')
      );
      expect(limitField).toBeDefined();
      expect(limitField?.type).toBe('number');
    });

    it('should have payer name search field', () => {
      const payerNameField = node.description.properties.find(
        (p) => p.name === 'payerName'
      );
      expect(payerNameField).toBeDefined();
      expect(payerNameField?.displayOptions?.show?.operation).toContain('searchByName');
    });
  });

  describe('Claim Status Fields', () => {
    it('should have search by option', () => {
      const searchByField = node.description.properties.find(
        (p) => p.name === 'searchBy'
      );
      expect(searchByField).toBeDefined();
      expect(searchByField?.type).toBe('options');
      
      const options = (searchByField as { options?: Array<{ value: string }> })?.options;
      const optionValues = options?.map((o) => o.value);
      expect(optionValues).toContain('patientControlNumber');
      expect(optionValues).toContain('payerClaimNumber');
      expect(optionValues).toContain('serviceDate');
    });
  });

  describe('Load Options Methods', () => {
    it('should have getPayers method', () => {
      expect(node.methods.loadOptions.getPayers).toBeDefined();
      expect(typeof node.methods.loadOptions.getPayers).toBe('function');
    });
  });
});
