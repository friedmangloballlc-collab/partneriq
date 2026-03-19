/**
 * add-brand-columns.js
 *
 * Tests which columns exist on the brands and decision_makers tables
 * by attempting a dry-run insert and checking the error response.
 *
 * Run with: node scripts/add-brand-columns.js
 *
 * NOTE: This script uses the anon key which cannot run ALTER TABLE.
 * It documents the current schema state and the column-mapping strategy
 * used in AdminDataManager.jsx for fields that lack dedicated columns.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://eiygbtpsfumwvhzbudij.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeWdidHBzZnVtd3ZoemJ1ZGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTgxMjUsImV4cCI6MjA4Nzk5NDEyNX0.qrIkEt-ZOIIs8-isz5qYaFZWEeVfYXqH6nir1u0vtrE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Column mapping documentation ─────────────────────────────────────────────

const BRAND_COLUMN_MAP = {
  // User spec field        → DB column (brands table)
  company_name:             "name",
  website:                  "domain",
  company_industry:         "industry",
  company_size:             "company_size",       // may exist; otherwise gracefully omitted
  company_address:          "location",
  company_country:          "location (appended)",
  email_format:             "contact_email",
  annual_budget:            "annual_budget",
  company_linkedin_url:     "description (JSON key: _linkedin)",
  company_founded:          "description (JSON key: _founded)",
  company_type:             "description (JSON key: _type)",
  // description raw text  → "description (JSON key: _desc)"
};

const CONTACT_COLUMN_MAP = {
  // User spec field        → DB column (decision_makers table)
  person_first_name:        "full_name (first part)",
  person_last_name:         "full_name (last part)",
  person_job_title:         "role_title",
  person_headline:          "role_title (fallback) + source (JSON key: _hl)",
  person_business_email:    "email",
  person_personal_email:    "source (JSON key: _pe)",
  person_phone:             "phone",
  person_company_name:      "brand_name",
  person_city:              "source (JSON key: _city)",
  person_location:          "source (JSON key: _loc)",
  person_linkedin_url:      "linkedin_url",
  person_linkedin_id:       "source (JSON key: _lid)",
  role_tier:                "role_tier",
  email_confidence:         "email_confidence",
  source:                   "source (JSON key: _src)",
};

console.log("=".repeat(60));
console.log("PartnerIQ — Column Mapping Report");
console.log("=".repeat(60));

// ─── Check brands table columns ───────────────────────────────────────────────

async function probeBrandsColumns() {
  console.log("\n[1] Probing brands table columns...");

  // Probe for company_size column (added in extended schema)
  const testRow = {
    name: "__schema_probe__",
    company_size: "1-10",
  };

  const { error } = await supabase.from("brands").insert(testRow);

  if (!error) {
    // Clean up the probe row
    await supabase.from("brands").delete().eq("name", "__schema_probe__");
    console.log("  company_size column: EXISTS");
  } else if (error.message.includes("company_size")) {
    console.log("  company_size column: MISSING — will be gracefully omitted on insert");
  } else {
    console.log("  company_size column: UNKNOWN (error:", error.message, ")");
    // Still clean up in case the row was partially inserted
    await supabase.from("brands").delete().eq("name", "__schema_probe__");
  }
}

// ─── Check decision_makers table columns ──────────────────────────────────────

async function probeContactsColumns() {
  console.log("\n[2] Verifying decision_makers table existing columns...");

  const { data, error } = await supabase
    .from("decision_makers")
    .select("id, full_name, role_title, role_tier, brand_name, email, email_confidence, linkedin_url, phone, source")
    .limit(1);

  if (error) {
    console.log("  Error reading decision_makers:", error.message);
  } else {
    console.log("  All expected columns confirmed: id, full_name, role_title, role_tier, brand_name, email, email_confidence, linkedin_url, phone, source");
  }
}

// ─── Print mapping tables ─────────────────────────────────────────────────────

function printMappings() {
  console.log("\n[3] Brand column mappings (CSV import spec → DB column):");
  Object.entries(BRAND_COLUMN_MAP).forEach(([spec, db]) => {
    console.log(`  ${spec.padEnd(28)} → ${db}`);
  });

  console.log("\n[4] Contact column mappings (CSV import spec → DB column):");
  Object.entries(CONTACT_COLUMN_MAP).forEach(([spec, db]) => {
    console.log(`  ${spec.padEnd(28)} → ${db}`);
  });
}

// ─── Strategy note ────────────────────────────────────────────────────────────

function printStrategy() {
  console.log("\n[5] Storage strategy for extra fields:");
  console.log("  Brands: Extra fields (linkedin_url, founded, type, country) are");
  console.log("          serialized as JSON in the `description` column with underscore-");
  console.log("          prefixed keys: { _desc, _linkedin, _founded, _type, _country }.");
  console.log("          When no extended data is present, description stores plain text.");
  console.log("");
  console.log("  Contacts: Extra fields (personal_email, city, location, linkedin_id,");
  console.log("            headline) are serialized as JSON in the `source` column with");
  console.log("            underscore-prefixed keys: { _src, _pe, _city, _loc, _lid, _hl }.");
  console.log("            When no extended data is present, source stores plain text.");
  console.log("");
  console.log("  AdminDataManager.jsx automatically parses these when editing or displaying");
  console.log("  rows, and re-serializes when saving. Rows saved by older code (plain text)");
  console.log("  are handled gracefully via try/catch JSON.parse fallbacks.");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    await probeBrandsColumns();
    await probeContactsColumns();
    printMappings();
    printStrategy();
    console.log("\n" + "=".repeat(60));
    console.log("Done.");
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

main();
