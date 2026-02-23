# GrowMeOrganic Integration Architecture

## Overview
GrowMeOrganic enriches partnership matches with verified B2B contact data and enables automated personalized outreach sequences.

## System Flow

### 1. Match Engine → Contact Enrichment
```
Match Engine identifies high-fit brand (score > 80)
         ↓
Enrichment Trigger (new backend function: enrichMatchWithContacts)
         ↓
GrowMeOrganic LinkedIn Search
  - Search by: Brand name + target role (VP Marketing, VP Partnerships, etc.)
  - Filters: company size, location, industry
         ↓
LinkedIn Profile Enrichment
  - Get verified email/phone for matched contacts
  - Store contact info in new ContactEnrichment entity
         ↓
Return enriched contact list to Match Engine UI
```

### 2. Contact Enrichment Entity
**New Entity: `ContactEnrichment`**
```json
{
  "partnership_id": "string",
  "brand_id": "string",
  "brand_name": "string",
  "contact_name": "string",
  "contact_email": "string",
  "contact_phone": "string",
  "job_title": "string",
  "linkedin_url": "string",
  "company": "string",
  "location": "string",
  "enrichment_status": "enum: [pending, enriched, failed, no_match]",
  "gmo_contact_id": "string",
  "email_verified": "boolean",
  "verification_status": "enum: [valid, invalid, unknown]",
  "enriched_at": "date-time",
  "outreach_initiated": "boolean"
}
```

### 3. Outreach Automation
```
Contact Enriched
         ↓
User reviews enriched contacts in Match Engine UI
         ↓
User clicks "Send Outreach" button
         ↓
createPersonalizedOutreach function triggers
  - Maps brand info + contact role to email template
  - Personalizes with contact name, company, brand details
  - Email Verification check (deliverability)
         ↓
createEmailSequence function creates multi-step sequence
  - Initial outreach (personalized)
  - Follow-up #1 (after 3 days)
  - Follow-up #2 (after 7 days)
  - Final follow-up (after 14 days)
         ↓
OutreachSequence entity auto-executes with time delays
         ↓
Track: opens, clicks, replies via email webhooks
```

## Backend Functions

### 1. `enrichMatchWithContacts` (new)
**Purpose:** Enrich a partnership match with verified B2B contacts
**Input:**
```json
{
  "partnership_id": "string",
  "brand_name": "string",
  "brand_industry": "string",
  "brand_location": "string",
  "partnership_type": "sponsorship | affiliate | ambassador | etc",
  "talent_name": "string"
}
```
**Process:**
1. Determine target job titles based on partnership_type (from mapping table)
2. Call GrowMeOrganic `/linkedin/search` endpoint
3. For each result, call `/linkedin/enrich` to get verified contact
4. Call `/email/verify` to validate deliverability
5. Create ContactEnrichment records in database
6. Return enriched contacts list

**Output:**
```json
{
  "success": true,
  "contacts_found": 3,
  "contacts": [
    {
      "name": "Sarah Johnson",
      "email": "sarah.johnson@brand.com",
      "phone": "+1-555-0123",
      "title": "VP of Partnerships",
      "linkedin_url": "linkedin.com/in/sarah-johnson",
      "email_valid": true
    }
  ]
}
```

### 2. `createPersonalizedOutreach` (update existing)
**New Capability:** Accepts enriched contact data
**Input:**
```json
{
  "partnership_id": "string",
  "contact_enrichment_id": "string",
  "contact_name": "string",
  "contact_email": "string",
  "contact_title": "string",
  "brand_name": "string",
  "talent_name": "string",
  "talent_niche": "string",
  "auto_sequence": true
}
```
**Process:**
1. Select email template based on partnership_type + contact_title
2. AI personalization:
   - Reference contact's company/role
   - Highlight talent fit for brand
   - Custom value proposition
   - CTA specific to role (partnership discussion vs. demo)
3. If `auto_sequence: true`, call `createEmailSequence`

### 3. `createEmailSequence` (new)
**Purpose:** Auto-generate multi-step outreach sequence
**Input:**
```json
{
  "partnership_id": "string",
  "contact_enrichment_id": "string",
  "contact_email": "string",
  "contact_name": "string",
  "initial_email_id": "string",
  "auto_send": true
}
```
**Process:**
1. Create OutreachSequence record with 4 steps
2. Schedule initial email for 1 hour from now (or immediate)
3. Auto-schedule follow-ups:
   - Step 2: +3 days
   - Step 3: +7 days
   - Step 4: +14 days
4. Generate follow-up email copies (AI-assisted)
5. Return sequence_id for tracking

## UI Integration Points

### Match Engine (Pages/MatchEngine.jsx)
**New Section: "Enriched Contacts"**
```jsx
{/* After displaying match results */}
{matchScore > 80 && (
  <EnrichedContactsPanel
    partnership_id={partnership.id}
    brand_name={brand.name}
    onEnrich={handleEnrichContacts}
    contacts={enrichedContacts}
    onSendOutreach={handleSendOutreach}
  />
)}
```

### New Component: `EnrichedContactsPanel`
- Shows: Name, Title, Email, LinkedIn URL
- Actions: 
  - "Send Personalized Outreach"
  - "View Email Preview"
  - "Customize Sequence"
- Status indicators: Email verified ✓, Contact found ✓

### Outreach Page (Pages/Outreach.jsx)
**New Tab: "Auto-Generated Sequences"**
- List all sequences created via GrowMeOrganic
- Show: Contact name, brand, sequence status, next send date
- Actions: Pause, edit, view performance

## Database Schema Updates

### Target Role Mapping Table
Create a reference table for role mapping:
```
partnership_type → target_job_titles
- "sponsorship" → ["VP of Sponsorships", "Head of Partnerships", "VP of Business Development"]
- "affiliate" → ["VP of Sales", "Head of Ad Sales", "VP of Commercial Partnerships"]
- "ambassador" → ["VP of Marketing", "CMO", "VP of Integrated Marketing"]
- etc.
```

## API Rate Limiting & Costs
- GrowMeOrganic: Unlimited (subscription-based credits)
- Recommendation: Batch enrichment to 5-10 contacts per match
- Cost: ~$0.50-1.00 per enriched contact (verify with pricing)

## Security & Privacy
- Store API key in BASE44 secrets: `GROWMEORGANIC_API_KEY`
- Never expose contact emails in frontend (except via authenticated UI)
- Email verification prevents bounces
- Track GDPR compliance: contact preferences, opt-outs

## Implementation Phases

### Phase 1: Contact Enrichment
1. Create ContactEnrichment entity
2. Build `enrichMatchWithContacts` function
3. Update Match Engine UI with enriched contacts panel
4. Test with sample brands

### Phase 2: Outreach Automation
1. Update `createPersonalizedOutreach` to support enriched contacts
2. Build `createEmailSequence` function
3. Create `EnrichedContactsPanel` component
4. Test end-to-end flow

### Phase 3: Analytics & Optimization
1. Track sequence performance (opens, clicks, replies)
2. Build dashboard for sequence metrics
3. A/B testing on email templates
4. ROI tracking per enriched contact

## Ready to Implement?
Once you have the GrowMeOrganic API key, set the secret `GROWMEORGANIC_API_KEY` and we can proceed with Phase 1.