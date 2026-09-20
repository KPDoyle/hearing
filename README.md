# hearing.

A connected hearing-care operations platform for independent clinics, patients, carers, care homes, and supply partners.

`hearing.` brings patient care, device servicing, consumables, fulfilment, recurring plans, billing, and partner coordination into one workspace. The repository includes a complete demonstration workspace with fictional records so a clinic can evaluate the full workflow safely.

## Commercial product surface

- Multi-workspace clinic setup with role-based access for administrators, clinicians, coordinators, suppliers, patients, and carers
- Patient profiles, funding routes, communication preferences, review dates, notes, and linked care records
- Hearing-device passports with serial numbers, fitting details, warranty dates, status, and compatibility guidance
- Repair and support case management with priority, supplier, due date, tracking, estimated cost, loan device, and workflow status
- Appointment management for clinic, remote, and care-home visits, including downloadable calendar files
- Consumables catalogue, stock levels, reorder thresholds, unit economics, supplier links, and compatibility records
- Patient supply orders from request through delivery, including stock reservation, tracking, and repeat reminders
- Supplier and care-home partner records with service terms, lead times, contacts, and status
- Service plans, monthly recurring value, invoice generation, payment status, and printable invoice exports
- Growth pipeline for care-home and commercial opportunities
- Patient/carer portal views for devices, repairs, appointments, messages, documents, invoices, and outcomes
- Care checks, listening goals, patient feedback, consent records, secure messages, documents, and team tasks
- Operational dashboards, global search, alerts, low-stock signals, overdue work, and commercial reports
- Stripe Checkout and webhook endpoints for payment integration
- D1 persistence, R2 document storage, optimistic revision checks, and audit history
- Optional Sign in with ChatGPT helpers and browser model-context tools

## Technology

- React 19 and Next.js-compatible Vinext routing
- TypeScript, Tailwind CSS, and accessible shadcn-style components
- Cloudflare Workers, D1, R2, and Drizzle ORM
- Stripe-ready server routes
- Zod validation and workspace-scoped authorization

## Run locally

Requirements: Node.js 22.13 or newer and pnpm 11.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by the development server. Without production identity headers, the app opens a fictional demonstration workspace.

## Verify a release

```bash
pnpm exec tsc --noEmit
pnpm build
```

## Production configuration

The default `build` and `start` commands produce a standard Next.js application for Vercel. When no production database is connected, the public deployment opens a fictional browser demo; demo changes are stored only in that browser and are not shared with other users.

Do not enter real patient information into browser-demo mode. Connect production identity, database, object storage, backups, and audit monitoring before onboarding a clinic.

The repository also retains Cloudflare-specific commands (`dev:cloudflare`, `build:cloudflare`, and `start:cloudflare`). For that deployment path, configure the bindings declared in `.openai/hosting.json`:

- `DB`: Cloudflare D1 database
- `BUCKET`: Cloudflare R2 bucket for documents

Apply the migration in `drizzle/0000_loving_nighthawk.sql` before accepting live records.

For workspace identity and access, pass the authenticated user and workspace headers documented by the deployment environment. Server routes always enforce membership and record scope; client-side navigation is not treated as authorization.

For Stripe payments, configure the secret key, webhook secret, and application URL expected by the checkout and webhook routes. Use test mode until products, pricing, tax handling, refunds, and reconciliation have been verified for the operating country.

## Safety and compliance

This repository is product software, not a certified medical device, clinical decision system, or complete electronic health record. Before using real patient data, complete an independent security, privacy, accessibility, clinical-safety, and regulatory review appropriate to the deployment region. Put data-processing agreements, retention rules, incident response, backups, access reviews, and supplier due diligence in place.

The demonstration seed data, organisations, email addresses, products, compatibility statements, and prices are fictional. Device and component compatibility must be verified by a qualified professional or manufacturer before fulfilment.

## Repository

Main branch: `main`

GitHub: https://github.com/KPDoyle/hearing
