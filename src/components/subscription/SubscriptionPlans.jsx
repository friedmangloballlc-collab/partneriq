// Talent Plans
export const TALENT_PLANS = {
  free: {
    tier: 'free',
    name: 'Starter',
    monthly_price: 0,
    annual_price: 0,
    description: 'Get started with the basics',
    features: [
      'Basic profile, appear in brand searches',
      'View up to 3 campaign briefs/mo',
      '1 active partnership',
      'In-app notifications',
      'Basic analytics (profile views only)'
    ],
    limits: {
      campaign_briefs: 3,
      active_partnerships: 1,
      outreach_messages: 0,
      sequences: 0,
      team_seats: 1,
      integrations: 0
    }
  },
  rising: {
    tier: 'rising',
    name: 'Rising',
    monthly_price: 99,
    annual_price: 990,
    description: 'Enhanced profile and outreach tools',
    features: [
      'Everything in Starter plus:',
      'Enhanced profile with media kit',
      'Unlimited campaign brief views',
      'Up to 5 active partnerships',
      'AI Match Engine (basic suggestions)',
      '15 outreach messages/mo',
      '2 active sequences',
      'Performance analytics dashboard',
      'ROI Simulator (basic projections)'
    ],
    limits: {
      campaign_briefs: 999999,
      active_partnerships: 5,
      outreach_messages: 15,
      sequences: 2,
      team_seats: 1,
      integrations: 0
    }
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    monthly_price: 249,
    annual_price: 2490,
    description: 'Full power for professionals',
    features: [
      'Everything in Rising plus:',
      'Priority placement in brand searches',
      'Up to 20 active partnerships',
      'AI Match Engine (smart scoring)',
      'Unlimited outreach messaging',
      'Unlimited sequences',
      'AI Pitch Deck Generation',
      'Full ROI Simulator with scenarios',
      'Advanced analytics & reporting',
      'Approval workflows',
      'Team collaboration (up to 3 seats)',
      '1 platform integration'
    ],
    limits: {
      campaign_briefs: 999999,
      active_partnerships: 20,
      outreach_messages: 999999,
      sequences: 999999,
      team_seats: 3,
      integrations: 1
    }
  },
  elite: {
    tier: 'elite',
    name: 'Elite',
    monthly_price: 499,
    annual_price: 4990,
    description: 'Unlimited potential',
    features: [
      'Everything in Pro plus:',
      'Unlimited partnerships',
      'AI Match Engine (auto-matching)',
      'AI-powered brand recommendations',
      'Custom pitch deck templates',
      'Unlimited team seats',
      'Unlimited integrations',
      'System health monitoring',
      'Custom architecture & workflows',
      'Dedicated account manager',
      'Priority support & onboarding',
      'Custom analytics & exports'
    ],
    limits: {
      campaign_briefs: 999999,
      active_partnerships: 999999,
      outreach_messages: 999999,
      sequences: 999999,
      team_seats: 999999,
      integrations: 999999
    }
  }
};

// Brand Plans
export const BRAND_PLANS = {
  free: {
    tier: 'free',
    name: 'Explorer',
    monthly_price: 0,
    annual_price: 0,
    description: 'Explore the platform',
    features: [
      'Basic brand profile',
      'Browse talent directory (limited results)',
      'Post 1 campaign brief/mo',
      '1 active partnership',
      'In-app notifications',
      'Basic analytics (campaign views only)',
      'Platform overview access'
    ],
    limits: {
      campaign_briefs: 1,
      active_partnerships: 1,
      outreach_messages: 0,
      sequences: 0,
      team_seats: 1,
      integrations: 0
    }
  },
  growth: {
    tier: 'growth',
    name: 'Growth',
    monthly_price: 499,
    annual_price: 4990,
    description: 'Scale your brand partnerships',
    features: [
      'Everything in Explorer plus:',
      'Full talent search & filters',
      'Up to 5 campaign briefs/mo',
      '15 active partnerships',
      'AI Match Engine (basic suggestions)',
      '50 outreach messages/mo',
      '3 active sequences',
      'ROI Simulator (basic projections)',
      'Approval workflows (1 approver)',
      'Performance analytics dashboard'
    ],
    limits: {
      campaign_briefs: 5,
      active_partnerships: 15,
      outreach_messages: 50,
      sequences: 3,
      team_seats: 1,
      integrations: 0
    }
  },
  scale: {
    tier: 'scale',
    name: 'Scale',
    monthly_price: 1299,
    annual_price: 12990,
    description: 'Enterprise-grade capabilities',
    features: [
      'Everything in Growth plus:',
      'Unlimited campaign briefs',
      'Up to 100 active partnerships',
      'AI Match Engine (smart scoring)',
      'Unlimited outreach & sequences',
      'AI Pitch Deck Generation',
      'Full ROI Simulator with scenarios',
      'Multi-step approval workflows',
      'Advanced analytics & custom reports',
      'Team collaboration (up to 10 seats)',
      'Up to 3 platform integrations',
      'AI Features (content suggestions)'
    ],
    limits: {
      campaign_briefs: 999999,
      active_partnerships: 100,
      outreach_messages: 999999,
      sequences: 999999,
      team_seats: 10,
      integrations: 3
    }
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    monthly_price: null,
    annual_price: null,
    description: 'Custom solution for your needs',
    features: [
      'Everything in Scale plus:',
      'Unlimited partnerships',
      'AI Match Engine (auto-matching)',
      'AI-powered talent recommendations',
      'Custom pitch deck templates',
      'Unlimited team seats & roles',
      'Unlimited integrations & API access',
      'System health monitoring',
      'Custom architecture & workflows',
      'White-label options',
      'Dedicated success manager',
      'SLA & priority support',
      'Custom analytics with BI exports',
      'SSO & advanced security'
    ],
    limits: {
      campaign_briefs: 999999,
      active_partnerships: 999999,
      outreach_messages: 999999,
      sequences: 999999,
      team_seats: 999999,
      integrations: 999999
    }
  }
};

// Agency Plans
export const AGENCY_PLANS = {
  starter: {
    tier: 'agency_starter',
    name: 'Agency Starter',
    monthly_price: 2499,
    annual_price: 24990,
    description: 'Manage multiple clients',
    features: [
      'Manage up to 5 brand accounts or 25 talent profiles',
      'Full talent search & filters',
      'AI Match Engine (smart scoring)',
      'Unlimited campaign briefs across accounts',
      'Unlimited outreach & sequences',
      'AI Pitch Deck Generation',
      'Full ROI Simulator with scenarios',
      'Multi-step approval workflows',
      'Advanced analytics & custom reports per client',
      'Team collaboration (up to 10 seats)',
      'Up to 3 platform integrations',
      'AI Features (content suggestions)',
      'Agency-level reporting & client dashboards',
      'White-label client reports'
    ],
    limits: {
      managed_accounts: 5,
      managed_talent: 25,
      team_seats: 10,
      integrations: 3,
      outreach_messages: 999999,
      sequences: 999999
    }
  },
  pro: {
    tier: 'agency_pro',
    name: 'Agency Pro',
    monthly_price: 4999,
    annual_price: 49990,
    description: 'Scale across multiple clients',
    features: [
      'Everything in Agency Starter plus:',
      'Manage up to 20 brand accounts or 100 talent profiles',
      'AI Match Engine (auto-matching)',
      'AI-powered recommendations across all accounts',
      'Custom pitch deck templates per client',
      'Unlimited team seats & role-based permissions',
      'Unlimited integrations & API access',
      'System health monitoring',
      'Custom architecture & workflows',
      'Cross-client analytics & benchmarking',
      'Dedicated account manager',
      'Priority support & onboarding',
      'Bulk outreach tools',
      'Multi-brand campaign coordination'
    ],
    limits: {
      managed_accounts: 20,
      managed_talent: 100,
      team_seats: 999999,
      integrations: 999999,
      outreach_messages: 999999,
      sequences: 999999
    }
  },
  enterprise: {
    tier: 'agency_enterprise',
    name: 'Agency Enterprise',
    monthly_price: null,
    annual_price: null,
    description: 'Unlimited white-label solution',
    features: [
      'Everything in Agency Pro plus:',
      'Unlimited brand accounts & talent profiles',
      'White-label platform with custom branding & domain',
      'Full API access with custom endpoints',
      'SSO & advanced security with audit logs',
      'Custom BI dashboards & data exports',
      'SLA-backed uptime & support',
      'Dedicated success team (not just one manager)',
      'Custom onboarding & training for agency staff',
      'Early access to new AI features & beta programs',
      'Revenue share or reseller options available'
    ],
    limits: {
      managed_accounts: 999999,
      managed_talent: 999999,
      team_seats: 999999,
      integrations: 999999,
      outreach_messages: 999999,
      sequences: 999999
    }
  }
};