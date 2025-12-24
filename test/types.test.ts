/**
 * Types Tests
 * Tests for pVerify type definitions and constants
 */

import {
  ServiceTypeCodes,
  RelationshipCodes,
  ErrorCodes,
} from '../nodes/PVerify/types';

describe('Type Definitions', () => {
  describe('ServiceTypeCodes', () => {
    it('should have common service type codes', () => {
      expect(ServiceTypeCodes['30']).toBe('Health Benefit Plan Coverage');
      expect(ServiceTypeCodes['48']).toBe('Hospital - Inpatient');
      expect(ServiceTypeCodes['50']).toBe('Hospital - Outpatient');
      expect(ServiceTypeCodes['86']).toBe('Emergency Services');
      expect(ServiceTypeCodes['88']).toBe('Pharmacy');
      expect(ServiceTypeCodes['98']).toBe('Professional (Physician)');
      expect(ServiceTypeCodes['MH']).toBe('Mental Health');
      expect(ServiceTypeCodes['UC']).toBe('Urgent Care');
    });

    it('should have mental health related codes', () => {
      expect(ServiceTypeCodes['A6']).toBe('Psychiatric - Inpatient');
      expect(ServiceTypeCodes['A7']).toBe('Psychiatric - Outpatient');
      expect(ServiceTypeCodes['A8']).toBe('Substance Abuse - Inpatient');
      expect(ServiceTypeCodes['A9']).toBe('Substance Abuse - Outpatient');
    });

    it('should have therapy codes', () => {
      expect(ServiceTypeCodes['BB']).toBe('Physical Therapy');
      expect(ServiceTypeCodes['BY']).toBe('Speech Therapy');
      expect(ServiceTypeCodes['BZ']).toBe('Occupational Therapy');
    });
  });

  describe('RelationshipCodes', () => {
    it('should have standard relationship codes', () => {
      expect(RelationshipCodes['18']).toBe('Self');
      expect(RelationshipCodes['01']).toBe('Spouse');
      expect(RelationshipCodes['19']).toBe('Child');
      expect(RelationshipCodes['20']).toBe('Employee');
      expect(RelationshipCodes['21']).toBe('Unknown');
      expect(RelationshipCodes['53']).toBe('Life Partner');
      expect(RelationshipCodes['G8']).toBe('Other Relationship');
    });

    it('should have donor codes', () => {
      expect(RelationshipCodes['39']).toBe('Organ Donor');
      expect(RelationshipCodes['40']).toBe('Cadaver Donor');
    });
  });

  describe('ErrorCodes', () => {
    it('should have invalid payer error', () => {
      expect(ErrorCodes.INVALID_PAYER.code).toBe('INVALID_PAYER');
      expect(ErrorCodes.INVALID_PAYER.message).toBe('Invalid Payer Code');
      expect(ErrorCodes.INVALID_PAYER.details).toContain('Payer List');
    });

    it('should have invalid NPI error', () => {
      expect(ErrorCodes.INVALID_NPI.code).toBe('INVALID_NPI');
      expect(ErrorCodes.INVALID_NPI.message).toBe('Invalid NPI');
      expect(ErrorCodes.INVALID_NPI.details).toContain('10-digit');
    });

    it('should have patient not found error', () => {
      expect(ErrorCodes.PATIENT_NOT_FOUND.code).toBe('PATIENT_NOT_FOUND');
      expect(ErrorCodes.PATIENT_NOT_FOUND.message).toBe('Patient Not Found');
    });

    it('should have auth failed error', () => {
      expect(ErrorCodes.AUTH_FAILED.code).toBe('AUTH_FAILED');
      expect(ErrorCodes.AUTH_FAILED.message).toBe('Authentication Failed');
    });

    it('should have rate limited error', () => {
      expect(ErrorCodes.RATE_LIMITED.code).toBe('RATE_LIMITED');
      expect(ErrorCodes.RATE_LIMITED.message).toBe('Rate Limited');
    });
  });
});
