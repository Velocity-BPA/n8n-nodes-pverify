# Changelog

All notable changes to n8n-nodes-pverify will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-22

### Added

- **Eligibility Summary** resource
  - Verify operation for quick eligibility checks with summarized benefits

- **Eligibility Inquiry (Full)** resource
  - Verify operation for complete 271 response with all benefit details

- **Medicare** resource
  - Verify Eligibility operation for Medicare Part A & B
  - MBI Lookup operation to find Medicare Beneficiary Identifier
  - Medicare Advantage Discovery operation to detect MA plans
  - Same or Similar operation for DME capped rental checks

- **Claim Status** resource
  - Check Status operation with search by patient control number, payer claim number, or service date

- **Payer List** resource
  - Get All operation with filtering options
  - Search by Name operation
  - Get by Code operation

- **Authentication**
  - OAuth2 client credentials flow
  - Automatic token caching and refresh
  - Support for sandbox and production environments

- **Helper Utilities**
  - Automatic date format conversion (ISO to MM/DD/YYYY)
  - Sensitive data masking for logging
  - Comprehensive error handling with helpful messages

- **Testing**
  - Unit tests for transport layer
  - Unit tests for type definitions
  - Node description validation tests
  - Integration tests with mock responses

- **Documentation**
  - Comprehensive README with examples
  - Common payer codes reference
  - Sample workflow descriptions
  - Troubleshooting guide

- **Licensing**
  - Business Source License 1.1 (BSL 1.1)
  - Commercial license available for production use
  - See LICENSE, COMMERCIAL_LICENSE.md, and LICENSING_FAQ.md

### Technical Details

- TypeScript 5.3 with strict mode
- n8n Nodes API Version 1
- Jest testing framework
- ESLint with n8n-nodes-base plugin
- Prettier code formatting

---

## Future Roadmap

### Planned for v1.1.0
- Batch eligibility operations
- Enhanced error recovery
- Additional payer-specific handling
- Response data transformation options

### Planned for v1.2.0
- Trigger node for eligibility change notifications
- Webhook support for async batch operations
- Extended Medicare operations

---

**Maintained by [Velocity BPA, LLC](https://velobpa.com)**
