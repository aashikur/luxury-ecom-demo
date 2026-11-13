# PaySync BD: Zero-Fee Automated MFS Payment Gateway

> [!IMPORTANT]
> **INDEPENDENT FUTURE SIDE-PROJECT SPECIFICATION (DISCLAIMER):**
> This document describes an independent, standalone Microservice / SaaS project ("PaySync BD").
> **It is NOT part of the core e-commerce engine in this repository.** Agents and developers working on the primary e-commerce pipeline must IGNORE this file during active feature development, builds, and migrations.

---

## 1. Executive Summary & Value Proposition

In Bangladesh, small and medium merchants lose **1.5% – 2.0%** per transaction when using traditional payment aggregator gateways (e.g., SSLCommerz, Shurjopay, bKash Merchant API). Additionally, getting a formal merchant account requires trade licenses, TINs, and lengthy bank verification processes.

**PaySync BD** turns any standard Android phone equipped with personal/agent bKash, Nagad, Rocket, or DBBL SIMs into a **zero-fee, 100% automated payment gateway**. 

Merchants simply plug the PaySync BD lightweight SDK / Webhook into their website (Client A, B, C). When a customer sends money, PaySync intercepts the incoming telecom SMS, parses the transaction details, and automatically validates the customer's order in real time.

---

## 2. High-Level Architecture & System Flow

```
   [ Customer ]
        │  Sends Money via bKash / Nagad / Rocket
        ▼
   [ Telecom Provider (bKash: 16247 / Nagad: 16167) ]
        │  Delivers Incoming SMS
        ▼
   [ Merchant Android Phone (SIM 1 / SIM 2) ]
        │  Background SMS Forwarder (HTTP POST)
        ▼
┌─────────────────────────────────────────────────────────────┐
│                 PAYSYNC BD CENTRAL GATEWAY                  │
│               (e.g., https://api.paysyncbd.com)             │
│                                                             │
│  1. Inbound Webhook Auth & Decryption                       │
│  2. Deterministic Regex Parser (TrxID, Amount, Phone)       │
│  3. Multi-Tenant Identification (API Key / Target SIM)      │
│  4. Deduplication & Anti-Replay Store (VerifiedSMS DB)      │
│  5. HMAC-SHA256 Signed Outbound Webhook Dispatcher          │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
    [ Client A: E-Com ]  [ Client B: Gym ]  [ Client C: SaaS ]
      (Order -> PAID)     (Sub -> ACTIVE)     (Credits -> +100)
```

---

## 3. Database Schema Specification (Multi-Tenant)

PaySync BD requires only 3 central collections/tables in MongoDB or PostgreSQL:

### A. `Tenants` (Registered Clients / Applications)
```typescript
export interface ITenant {
  _id: string;
  name: string;                         // e.g., "VectorFit Lab", "Silk & Cotton BD"
  email: string;
  apiKey: string;                       // Public client ID e.g., "pk_live_xxxx"
  secretKey: string;                    // Used to sign webhooks (HMAC-SHA256)
  webhookUrl: string;                   // "https://client-site.com/api/webhooks/paysync"
  assignedPhoneNumbers: string[];       // ["01711XXXXXX", "01911XXXXXX"]
  isActive: boolean;
  rateLimitPerMinute: number;           // Default: 120
  createdAt: Date;
}
```

### B. `VerifiedSMS` (Inbound SMS Ledger & State Machine)
```typescript
export type MfsGateway = 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY' | 'BANK';

export interface IVerifiedSMS {
  _id: string;
  tenantId: string;                     // Foreign key to Tenants
  gateway: MfsGateway;                  // Auto-normalized
  rawText: string;                      // Full unparsed SMS string
  trxId: string;                        // e.g., "BLA892XYZ" (Unique index)
  amount: number;                       // e.g., 1850
  userBankAccount: string;              // Normalized phone e.g., "01911470598"
  isUsed: boolean;                      // False until matched or consumed
  matchedEntityId?: string;             // e.g., Order ID or Subscription ID
  sourcePhone?: string;                 // Device sender / SIM slot
  receivedAt: Date;
}
```

### C. `PendingVerifications` (Optional Reverse-Polling Queue)
```typescript
export interface IPendingVerification {
  _id: string;
  tenantId: string;
  externalRefId: string;                // e.g., "ORDER-10492"
  expectedAmount: number;
  expectedSenderPhone?: string;
  expectedTrxId?: string;
  status: 'PENDING' | 'MATCHED' | 'EXPIRED';
  expiresAt: Date;                      // TTL index (e.g., 30 minutes)
}
```

---

## 4. The Core Regex & Normalization Engine (Proven VectorFit Logic)

Extracted from production testing, these deterministic parsers handle Bengali English, messy whitespaces, commas in amounts, and parentheses formatting:

```typescript
// 1. Account / Phone Normalization
export const normalizePhone = (value?: string): string => {
  if (!value) return '';
  const clean = value.trim().replace(/[\s-]+/g, '');
  const match = clean.match(/(?:\+?88)?(01[3-9]\d{8})/);
  return match ? match[1] : clean;
};

// 2. Gateway Type Matcher
export const detectGateway = (text: string, from?: string): MfsGateway => {
  const combined = `${from || ''} ${text}`.toLowerCase();
  if (combined.includes('bkash')) return 'BKASH';
  if (combined.includes('nagad')) return 'NAGAD';
  if (combined.includes('rocket') || combined.includes('16216')) return 'ROCKET';
  return 'BANK';
};

// 3. TrxID Extractor
export const extractTrxId = (text: string): string => {
  const match = text.match(/\b(?:trx\s*id|trxid|transaction\s*id|txn\s*id|txn)\s*[:#-]?\s*([a-z0-9]+)\b/i);
  return match?.[1]?.toUpperCase() || '';
};

// 4. Amount Extractor (Handles "Tk 1,850", "BDT 500.00", "2,000 Tk")
export const extractAmount = (text: string): number => {
  const patterns = [
    /(?:tk|bdt|amount)\s*[:=]?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/i,
    /([0-9][0-9,]*(?:\.[0-9]+)?)\s*(?:tk|bdt)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const parsed = Number(match[1].replace(/,/g, ''));
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return NaN;
};
```

---

## 5. API Contracts

### A. Inbound Forwarder Webhook (`POST /api/v1/sms/inbound`)
Called by the Android SMS Forwarder application:
```json
// Headers:
// x-device-token: "sec_dev_9823471029384"

{
  "text": "You have received Tk 1,850.00 from 01911470598. Fee Tk 0.00. Balance Tk 24,190.50. TrxID BLA719284 at 13/11/2026 12:45",
  "from": "bKash",
  "deviceSim": "01711223344"
}
```

### B. Outbound Webhook to Client Site (`POST https://client.com/api/paysync-webhook`)
PaySync BD signs the payload using `HMAC-SHA256` with the client's `secretKey`:
```json
// Headers:
// x-paysync-signature: "d7f8a9...sha256_hash..."

{
  "event": "PAYMENT_RECEIVED",
  "gateway": "BKASH",
  "trxId": "BLA719284",
  "amount": 1850,
  "senderPhone": "01911470598",
  "receivedAt": "2026-11-13T06:45:00.000Z"
}
```

### C. Direct Client Verification API (`POST /api/v1/verify`)
For checkout flows where the client website checks if money arrived for an order:
```json
// Request:
{
  "apiKey": "pk_live_vectorfit_123",
  "trxId": "BLA719284",
  "amount": 1850,
  "senderPhone": "01911470598"
}

// Response (200 OK):
{
  "success": true,
  "matched": true,
  "payment": {
    "trxId": "BLA719284",
    "amount": 1850,
    "senderPhone": "01911470598",
    "verifiedAt": "2026-11-13T06:46:12.000Z"
  }
}
```

---

## 6. Android Mobile Forwarder Setup

To forward incoming SMS from the merchant's physical phone to the PaySync BD server without building a custom native APK from scratch:
1. **Open-Source App:** Use **SMS Forwarder** (F-Droid / GitHub) or **Automate / Tasker**.
2. **Rule Configuration:**
   - Filter: Sender contains `bKash` OR `16247` OR `Nagad` OR `16167` OR `Rocket` OR `16216`.
   - Action: HTTP POST request to `https://api.paysyncbd.com/api/v1/sms/inbound`.
   - Headers: `x-device-token: YOUR_SECRET_DEVICE_TOKEN`.
   - Body format: JSON containing `{ "text": "%sms_body", "from": "%sms_from" }`.

---

## 7. Security & Anti-Fraud Guardrails

1. **Replay Attack Defense:** `trxId` must have a MongoDB `unique: true` index. Once an SMS is processed (`isUsed = true`), it can never be verified a second time.
2. **Amount Threshold:** The client verification predicate must strictly verify:
   $$\text{sms.amount} \ge \text{order.totalAmount}$$
   If a customer owes ৳2,000 but sends ৳1,500, the verification **must reject** auto-approval.
3. **Webhook Signature Validation:** Clients must verify `x-paysync-signature` via `crypto.createHmac('sha256', secretKey)`.
4. **Phone Masking / PII:** Raw SMS balances (`Balance Tk 24,190.50`) must be stripped before forwarding to client sites to protect merchant financial privacy.

---

## 8. Commercial & Monetization Model

PaySync BD can be packaged and licensed to Bangladeshi digital businesses using two simple tiers:

1. **Self-Hosted License:** One-time \$150 – \$300 per client (they host it on their own \$5/mo VPS).
2. **Hosted SaaS Multi-Tenant:**
   - **Starter:** ৳999/month (Up to 1,000 transactions, 1 SIM).
   - **Growth:** ৳2,499/month (Unlimited transactions, up to 3 SIMs bKash/Nagad/Rocket).
   - *Savings Pitch:* "A store doing ৳5,00,000/month saves ৳10,000/month in SSLCommerz fees by paying only ৳999/month for PaySync BD."
