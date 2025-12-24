# n8n-nodes-pverify

[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

---

![n8n Community Node](https://img.shields.io/badge/n8n-community%20node-orange)
![License](https://img.shields.io/badge/license-BSL%201.1-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![Healthcare](https://img.shields.io/badge/industry-Healthcare-red)

An n8n community node for **pVerify** - the leading healthcare eligibility verification API. Automate patient insurance eligibility checks, Medicare lookups, benefits verification, and coordination of benefits across 1,500+ payers.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Authentication Setup](#authentication-setup)
- [Available Operations](#available-operations)
- [Usage Examples](#usage-examples)
- [Common Payer Codes](#common-payer-codes)
- [API Response Reference](#api-response-reference)
- [Sample Workflows](#sample-workflows)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Licensing](#licensing)
- [Support](#support)

## ✨ Features

- **Real-time Eligibility Verification** - Instant 270/271 transactions with 1,500+ payers
- **Medicare Support** - Complete Medicare Part A/B eligibility, MBI lookup, and Medicare Advantage discovery
- **Benefits Summary** - Deductibles, copays, out-of-pocket maximums, and coverage details
- **Claim Status** - Check submitted claim status with supported payers
- **Same or Similar** - Medicare DME capped rental/same or similar checks
- **Payer Directory** - Search and browse the complete payer database
- **HIPAA Compliant** - Secure handling of PHI data
- **Automatic Token Management** - OAuth2 token refresh handled automatically

## 📦 Installation

### Via n8n Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter: `n8n-nodes-pverify`
5. Click **Install**

### Via npm (Self-hosted n8n)

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the node package
npm install n8n-nodes-pverify

# Restart n8n
# For PM2: pm2 restart n8n
# For Docker: docker restart n8n
# For systemd: sudo systemctl restart n8n
```

### Manual Installation (Development)

```bash
# Extract and navigate
unzip n8n-nodes-pverify.zip
cd n8n-nodes-pverify

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n (for development)
npm link
cd ~/.n8n
npm link n8n-nodes-pverify

# Restart n8n
```

## 🔐 Authentication Setup

### 1. Get pVerify API Credentials

1. Sign up at [pVerify Developer Portal](https://pverify.com/api-developers/)
2. Create a new application to get your **Client ID** and **Client Secret**
3. Note: Sandbox credentials are available for testing

### 2. Configure Credentials in n8n

1. In n8n, go to **Credentials** → **New Credential**
2. Search for **pVerify API**
3. Enter your credentials:

| Field | Description |
|-------|-------------|
| **Environment** | `Sandbox` for testing, `Production` for live |
| **Client ID** | Your pVerify API Client ID |
| **Client Secret** | Your pVerify API Client Secret |

4. Click **Save**

## 🛠️ Available Operations

### Eligibility Summary
Quick eligibility verification with summarized benefits.

| Operation | Description |
|-----------|-------------|
| **Verify** | Get high-level eligibility status and benefits summary |

### Eligibility Inquiry (Full)
Complete 271 response with all benefit details.

| Operation | Description |
|-----------|-------------|
| **Verify** | Get complete eligibility details including all benefit categories |

### Medicare
Medicare-specific operations.

| Operation | Description |
|-----------|-------------|
| **Verify Eligibility** | Medicare Part A & B eligibility verification |
| **MBI Lookup** | Find Medicare Beneficiary Identifier by patient demographics |
| **Medicare Advantage Discovery** | Discover if patient has a Medicare Advantage plan |
| **Same or Similar** | Check DME same/similar service history |

### Claim Status
Check status of submitted claims.

| Operation | Description |
|-----------|-------------|
| **Check Status** | Get claim status by control number, payer number, or service date |

### Payer List
Access the payer directory.

| Operation | Description |
|-----------|-------------|
| **Get All** | Get complete list of 1,500+ supported payers |
| **Search by Name** | Search payers by name |
| **Get by Code** | Get specific payer by pVerify code |

## 📖 Usage Examples

### Basic Eligibility Check

```json
{
  "resource": "eligibilitySummary",
  "operation": "verify",
  "payerCode": "00001",
  "providerNpi": "1234567890",
  "subscriberMemberId": "ABC123456789",
  "subscriberFirstName": "John",
  "subscriberLastName": "Doe",
  "subscriberDob": "1985-03-15",
  "dosStartDate": "2024-03-20",
  "dosEndDate": "2024-03-20",
  "isSubscriberPatient": true
}
```

### Medicare MBI Lookup

```json
{
  "resource": "medicare",
  "operation": "mbiLookup",
  "providerNpi": "1234567890",
  "subscriberFirstName": "Mary",
  "subscriberLastName": "Johnson",
  "subscriberDob": "1950-12-01",
  "subscriberGender": "F",
  "subscriberSsn": "1234"
}
```

### Dependent Eligibility Check

```json
{
  "resource": "eligibilitySummary",
  "operation": "verify",
  "payerCode": "00192",
  "providerNpi": "1234567890",
  "subscriberMemberId": "UHC987654321",
  "subscriberFirstName": "Robert",
  "subscriberLastName": "Smith",
  "subscriberDob": "1980-06-20",
  "isSubscriberPatient": false,
  "dependentFirstName": "Emma",
  "dependentLastName": "Smith",
  "dependentDob": "2015-09-10",
  "dependentRelationship": "19",
  "dosStartDate": "2024-03-20",
  "dosEndDate": "2024-03-20"
}
```

## 🏢 Common Payer Codes

| Code | Payer Name |
|------|------------|
| `00001` | Aetna |
| `00007` | Medicare Part A & B |
| `00165` | Ohio Medicaid |
| `00192` | United Healthcare |
| `00220` | BCBS of Texas |
| `00282` | Cigna |
| `00350` | Humana |
| `00532` | Anthem BCBS |

Use the **Payer List** operation to search for additional payer codes.

## 📊 API Response Reference

### Eligibility Summary Response

```json
{
  "requestId": "req-12345",
  "eligibilityStatus": "Active",
  "planCoverageSummary": {
    "status": "Active",
    "effectiveDate": "01/01/2024",
    "planName": "Gold PPO Plan",
    "groupNumber": "GRP12345",
    "policyType": "PPO"
  },
  "copayDeductibleSummary": {
    "individualDeductible": "$500.00",
    "individualDeductibleRemaining": "$250.00",
    "individualOOP": "$3,000.00",
    "copays": [
      {
        "serviceType": "Office Visit",
        "copayAmount": "$25.00",
        "coinsurance": "20%"
      }
    ]
  }
}
```

### Eligibility Status Values

| Status | Description |
|--------|-------------|
| `Active` | Coverage is active and valid |
| `Inactive` | Coverage has been terminated |
| `Pending` | Coverage is pending activation |
| `Unknown` | Unable to determine status |

## 🔄 Sample Workflows

### Pre-Appointment Eligibility Check

1. **Trigger:** Webhook from scheduling system
2. **pVerify:** Eligibility Summary
3. **IF:** Check eligibility status
   - Active → Update patient record, calculate responsibility
   - Inactive → Send alert to scheduling team
4. **Output:** Store verification results

### Daily Batch Verification

1. **Trigger:** Schedule (6:00 AM daily)
2. **Database:** Get today's appointments
3. **Loop:** For each patient
4. **pVerify:** Eligibility Summary
5. **Database:** Update verification status
6. **Email:** Send report of issues to front desk

### Medicare MBI Discovery

1. **Trigger:** Manual or form submission
2. **pVerify:** MBI Lookup
3. **IF:** MBI found
   - Yes → **pVerify:** Medicare Advantage Discovery
   - No → Alert for manual follow-up
4. **Database:** Store Medicare information

## ❗ Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid Payer Code` | Payer code not found | Use Payer List operation to find valid codes |
| `Invalid NPI` | NPI format incorrect | Ensure NPI is exactly 10 digits |
| `Patient Not Found` | No match for demographics | Verify member ID, DOB, and payer code |
| `Authentication Failed` | Invalid credentials | Check Client ID and Secret |
| `Rate Limited` | Too many requests | Wait and implement exponential backoff |

### Date Format Issues

pVerify requires dates in `MM/DD/YYYY` format. The node automatically converts ISO dates, but ensure your input dates are valid.

### Payer-Specific Issues

Some payers may:
- Require specific subscriber ID formats
- Have limited service hours
- Return partial information

Use the Payer List to check payer capabilities and requirements.

## 💻 Development

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-pverify.git
cd n8n-nodes-pverify

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode (development)
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- transport.test.ts
```

### Project Structure

```
n8n-nodes-pverify/
├── credentials/
│   └── PVerifyApi.credentials.ts
├── nodes/
│   └── PVerify/
│       ├── PVerify.node.ts
│       ├── pverify.svg
│       ├── descriptions/
│       │   ├── EligibilitySummary.description.ts
│       │   ├── EligibilityInquiry.description.ts
│       │   ├── Medicare.description.ts
│       │   ├── ClaimStatus.description.ts
│       │   └── PayerList.description.ts
│       ├── transport/
│       │   └── index.ts
│       └── types/
│           └── index.ts
├── test/
│   ├── setup.ts
│   ├── transport.test.ts
│   ├── types.test.ts
│   ├── node.test.ts
│   └── integration.test.ts
├── package.json
├── tsconfig.json
├── LICENSE
├── COMMERCIAL_LICENSE.md
├── LICENSING_FAQ.md
└── README.md
```

## 📄 Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for full details.

### Third-Party Notice

pVerify® is a registered trademark of pVerify, Inc. This n8n community node is an independent integration and is not affiliated with, endorsed by, or sponsored by pVerify, Inc. Use of the pVerify® API requires a separate agreement with pVerify, Inc.

## 🤝 Support

### Documentation

- [pVerify API Documentation](https://postman.pverify.com/)
- [pVerify Developer Portal](https://pverify.com/api-developers/)
- [n8n Node Development Guide](https://docs.n8n.io/integrations/creating-nodes/)

### Getting Help

- **Issues:** [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-pverify/issues)
- **Commercial Support:** licensing@velobpa.com
- **Website:** [velobpa.com](https://velobpa.com)

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

---

**Built with ❤️ by [Velocity BPA](https://velobpa.com)**

*Accelerating Healthcare Revenue Cycle Automation*
