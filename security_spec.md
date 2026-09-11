# TK Stationery — Security Specification & RBAC Matrix

## 1. Data Invariants & Access Control Policy
1. **Client / Admin Separation**: Regular customer accounts cannot access administrative routes or read/write administrative collections.
2. **Identity Integrity**: Document ownership (`userId`, `customerId`) must strictly match `request.auth.uid` unless the actor is a verified `staff`, `admin`, or `super_admin`.
3. **Role Escalation Defense**: Customers can NEVER self-assign or modify the `role` field on their profile document. Role changes are restricted to `admin` / `super_admin`.
4. **Order / Payment Privacy**: Customers can only list and retrieve orders and payment transactions where `customerId == request.auth.uid`.
5. **Product & Inventory Authorization**: Only `admin` and `super_admin` can create, update, or delete products and catalog categories.
6. **Audit Trail Immutability**: `auditLogs` is strictly append-only; update and delete operations are forbidden for all roles including administrators.

---

## 2. The "Dirty Dozen" Threat Vectors (RBAC Attack Payloads)

| Vector ID | Target Collection / Path | Attack Scenario | Invariant Checked | Expected Result |
|---|---|---|---|---|
| **V-01** | `/users/{uid}` | Customer attempts to update own role to `super_admin` | Role Escalation Guard | **PERMISSION_DENIED** |
| **V-02** | `/users/{targetUid}` | Customer attempts to read another user's PII profile | PII Isolation | **PERMISSION_DENIED** |
| **V-03** | `/products/{productId}` | Unauthenticated or customer user attempts to change price / stock | Catalog Integrity | **PERMISSION_DENIED** |
| **V-04** | `/orders` (list) | Customer queries all orders without filtering by own `customerId` | Query Enforcer | **PERMISSION_DENIED** |
| **V-05** | `/orders/{orderId}` | Customer attempts to mark order as `Completed` or `Paid` | State Mutation Tier | **PERMISSION_DENIED** |
| **V-06** | `/payments` (list) | Customer queries global payment transactions | Payment Privacy | **PERMISSION_DENIED** |
| **V-07** | `/payments/{id}` | Customer attempts to alter `status` to `successful` | Financial Guard | **PERMISSION_DENIED** |
| **V-08** | `/auditLogs/{logId}` | Admin attempts to edit or delete historical audit entries | Immutability Rule | **PERMISSION_DENIED** |
| **V-09** | `/categories/{id}` | Anonymous user attempts to delete category | Write Gate | **PERMISSION_DENIED** |
| **V-10** | `/notifications` (list) | Customer lists notifications belonging to other UIDs | Scoped Notification Read | **PERMISSION_DENIED** |
| **V-11** | `/settings/general` | Non-admin user attempts to alter store contact/payment accounts | Settings Gate | **PERMISSION_DENIED** |
| **V-12** | `/quotes/{quoteId}` | Customer attempts to update internal admin notes / estimate | Tiered Identity Logic | **PERMISSION_DENIED** |

---

## 3. RBAC Hierarchy Definition
- `customer`: Base consumer tier. Can manage own profile, place orders, book service tickets, request quotes, initiate payments, and view own transactional history.
- `staff`: Operations tier. Can view and process customer orders, update ticket statuses, respond to quotes, and verify incoming payments.
- `admin`: Store management tier. Full catalog control, price and inventory editing, payment status adjustments, and viewing audit logs.
- `super_admin`: System executive tier. Comprehensive system authority, including user management and role assignment.
