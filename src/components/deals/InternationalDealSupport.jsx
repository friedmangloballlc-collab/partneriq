import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

// ─── Static Data ──────────────────────────────────────────────────────────────

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", jurisdiction: "US" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", jurisdiction: "EU" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", jurisdiction: "UK" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", jurisdiction: "CA" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", jurisdiction: "AU" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", jurisdiction: "JP" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭", jurisdiction: "CH" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪", jurisdiction: "EU" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴", jurisdiction: "NO" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰", jurisdiction: "EU" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿", jurisdiction: "NZ" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬", jurisdiction: "SG" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰", jurisdiction: "HK" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", flag: "🇲🇽", jurisdiction: "MX" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷", jurisdiction: "BR" },
];

// Static exchange rates relative to USD (as of early 2025 approximation)
const FX_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  CHF: 0.90,
  SEK: 10.42,
  NOK: 10.55,
  DKK: 6.89,
  NZD: 1.63,
  SGD: 1.34,
  HKD: 7.82,
  MXN: 17.15,
  BRL: 4.97,
};

// Compliance rules per jurisdiction
const COMPLIANCE_RULES = {
  US: [
    {
      id: "ftc",
      label: "FTC Disclosure Required",
      description: "All sponsored content must include #ad or #sponsored per FTC guidelines.",
      severity: "required",
      icon: ShieldCheck,
    },
    {
      id: "us_tax",
      label: "US Tax Form (W-9/W-8BEN)",
      description: "Payments over $600 require a W-9 for US persons or W-8BEN for foreign persons.",
      severity: "required",
      icon: DollarSign,
    },
  ],
  UK: [
    {
      id: "asa",
      label: "ASA Compliance (UK)",
      description: "UK Advertising Standards Authority requires clear labeling of ads. Use #Ad.",
      severity: "required",
      icon: ShieldCheck,
    },
    {
      id: "uk_vat",
      label: "UK VAT (20%)",
      description: "VAT applicable on services provided to UK-based businesses.",
      severity: "info",
      icon: DollarSign,
    },
  ],
  EU: [
    {
      id: "gdpr",
      label: "GDPR Data Requirements",
      description:
        "Audience data collection and processing must comply with GDPR. Data processing agreements may be required.",
      severity: "required",
      icon: ShieldCheck,
    },
    {
      id: "eu_disclosure",
      label: "EU Influencer Disclosure",
      description:
        "EU Directive 2005/29/EC requires commercial intent to be clearly identifiable. Use #Werbung (DE), #Publicité (FR), etc.",
      severity: "required",
      icon: AlertTriangle,
    },
    {
      id: "eu_vat",
      label: "EU VAT OSS",
      description: "VAT rates vary by EU member state (17-27%). Consider VAT OSS registration.",
      severity: "info",
      icon: DollarSign,
    },
  ],
  CA: [
    {
      id: "crtc",
      label: "CRTC/CASL Compliance",
      description: "Canadian Anti-Spam Legislation may apply to promotional electronic messages.",
      severity: "info",
      icon: ShieldCheck,
    },
  ],
  AU: [
    {
      id: "accc",
      label: "ACCC Influencer Guidelines",
      description:
        "Australian Competition and Consumer Commission requires disclosure of material benefits.",
      severity: "required",
      icon: ShieldCheck,
    },
    {
      id: "au_gst",
      label: "Australian GST (10%)",
      description: "GST applies to services provided to Australian businesses.",
      severity: "info",
      icon: DollarSign,
    },
  ],
  JP: [
    {
      id: "jp_consumption_tax",
      label: "Japan Consumption Tax (10%)",
      description: "Consumption tax applies on services provided in Japan.",
      severity: "info",
      icon: DollarSign,
    },
  ],
  SG: [],
  HK: [],
  CH: [
    {
      id: "ch_vat",
      label: "Swiss VAT (7.7%)",
      description: "VAT applies on services provided to Swiss businesses.",
      severity: "info",
      icon: DollarSign,
    },
  ],
  NO: [],
  NZ: [
    {
      id: "nz_gst",
      label: "New Zealand GST (15%)",
      description: "GST applies on services provided in New Zealand.",
      severity: "info",
      icon: DollarSign,
    },
  ],
  MX: [],
  BR: [
    {
      id: "br_tax",
      label: "Brazilian Service Tax (ISS)",
      description: "Service tax (ISS) up to 5% may apply on influencer marketing services.",
      severity: "info",
      icon: DollarSign,
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function convertAmount(amount, fromCurrency, toCurrency) {
  if (!amount || isNaN(amount)) return null;
  const usd = amount / (FX_RATES[fromCurrency] || 1);
  return usd * (FX_RATES[toCurrency] || 1);
}

function formatAmount(amount, currency) {
  if (!amount && amount !== 0) return "—";
  const curr = CURRENCIES.find((c) => c.code === currency);
  const sym = curr?.symbol || currency;
  if (Math.abs(amount) >= 1000) {
    return `${sym}${(amount / 1000).toFixed(1)}K`;
  }
  return `${sym}${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function detectJurisdiction(deal) {
  // Attempt to detect jurisdiction from deal metadata
  const locations = [
    deal?.talent_location,
    deal?.brand_location,
    deal?.country,
    deal?.location,
  ]
    .filter(Boolean)
    .map((l) => l.toLowerCase());

  if (locations.some((l) => l.includes("uk") || l.includes("united kingdom") || l.includes("britain"))) return "UK";
  if (locations.some((l) => l.includes("eu") || l.includes("europe") || l.includes("germany") || l.includes("france") || l.includes("spain") || l.includes("italy") || l.includes("netherlands"))) return "EU";
  if (locations.some((l) => l.includes("canada"))) return "CA";
  if (locations.some((l) => l.includes("australia"))) return "AU";
  if (locations.some((l) => l.includes("japan"))) return "JP";
  if (locations.some((l) => l.includes("singapore"))) return "SG";
  // Default to US
  return "US";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CurrencyRow({ currency, amount, isBase }) {
  const curr = CURRENCIES.find((c) => c.code === currency.code);
  return (
    <div
      className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${
        isBase ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{curr?.flag}</span>
        <div>
          <span className="text-xs font-semibold text-slate-700">{currency.code}</span>
          <span className="text-[10px] text-slate-400 ml-1">{currency.name}</span>
        </div>
      </div>
      <span className={`text-sm font-bold ${isBase ? "text-indigo-700" : "text-slate-700"}`}>
        {amount !== null ? formatAmount(amount, currency.code) : "—"}
      </span>
    </div>
  );
}

function ComplianceFlag({ rule }) {
  const Icon = rule.icon;
  const isRequired = rule.severity === "required";

  return (
    <div
      className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${
        isRequired
          ? "bg-amber-50 border-amber-200"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <Icon
        className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
          isRequired ? "text-amber-600" : "text-slate-500"
        }`}
      />
      <div>
        <div className="flex items-center gap-1.5">
          <p className={`text-xs font-semibold ${isRequired ? "text-amber-800" : "text-slate-700"}`}>
            {rule.label}
          </p>
          {isRequired && (
            <Badge className="text-[9px] bg-red-100 text-red-700 border-red-200 border px-1.5 py-0">
              Required
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{rule.description}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InternationalDealSupport({ deal }) {
  const dealValue = deal?.deal_value || 0;

  // Detect base jurisdiction from deal
  const detectedJurisdiction = useMemo(() => detectJurisdiction(deal || {}), [deal]);

  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(detectedJurisdiction);
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  // Compute conversions for major display currencies
  const displayCurrencies = showAllCurrencies ? CURRENCIES : CURRENCIES.slice(0, 6);

  const conversions = useMemo(() => {
    return displayCurrencies.map((c) => ({
      currency: c,
      amount: dealValue
        ? convertAmount(dealValue, selectedCurrency, c.code)
        : null,
    }));
  }, [dealValue, selectedCurrency, displayCurrencies]);

  const complianceRules = useMemo(() => {
    return COMPLIANCE_RULES[selectedJurisdiction] || [];
  }, [selectedJurisdiction]);

  const JURISDICTION_OPTIONS = [
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "EU", label: "European Union" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "JP", label: "Japan" },
    { value: "SG", label: "Singapore" },
    { value: "CH", label: "Switzerland" },
    { value: "NO", label: "Norway" },
    { value: "NZ", label: "New Zealand" },
    { value: "MX", label: "Mexico" },
    { value: "BR", label: "Brazil" },
  ];

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          International Deal Support
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Currency Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Base Currency
            </label>
            {dealValue > 0 && (
              <span className="text-[10px] text-slate-400">
                Deal: {formatAmount(dealValue, selectedCurrency)}
              </span>
            )}
          </div>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                    <span className="text-slate-400 text-xs">{c.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conversion table */}
        {dealValue > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
              Equivalent Values
            </p>
            <div className="space-y-0.5">
              {conversions.map(({ currency, amount }) => (
                <CurrencyRow
                  key={currency.code}
                  currency={currency}
                  amount={amount}
                  isBase={currency.code === selectedCurrency}
                />
              ))}
            </div>
            <button
              onClick={() => setShowAllCurrencies(!showAllCurrencies)}
              className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 transition-colors mt-1"
            >
              {showAllCurrencies ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show fewer currencies
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show all {CURRENCIES.length} currencies
                </>
              )}
            </button>
            <p className="text-[9px] text-slate-300 mt-1">
              Static rates — indicative only, not live market rates.
            </p>
          </div>
        )}

        {dealValue === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">
            Add a deal value to see currency conversions.
          </p>
        )}

        {/* Jurisdiction selector */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Jurisdiction
            </label>
            {detectedJurisdiction !== selectedJurisdiction && (
              <button
                onClick={() => setSelectedJurisdiction(detectedJurisdiction)}
                className="text-[10px] text-indigo-600 hover:underline"
              >
                Reset to detected
              </button>
            )}
          </div>
          <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JURISDICTION_OPTIONS.map((j) => (
                <SelectItem key={j.value} value={j.value}>
                  {j.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {detectedJurisdiction === selectedJurisdiction && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Info className="w-3 h-3" />
              Auto-detected from deal data
            </div>
          )}
        </div>

        {/* Compliance flags */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Compliance Checklist
          </p>
          {complianceRules.length === 0 ? (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-700">
                No specific compliance requirements identified for this jurisdiction.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {complianceRules.map((rule) => (
                <ComplianceFlag key={rule.id} rule={rule} />
              ))}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
