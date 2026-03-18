const FLAGS = {
  ai_command_center: { enabled: true, plans: ['pro', 'elite', 'growth', 'scale', 'agency_starter', 'agency_pro', 'agency_enterprise'] },
  bulk_outreach: { enabled: true, plans: ['pro', 'elite', 'scale', 'agency_starter', 'agency_pro', 'agency_enterprise'] },
  pitch_deck_builder: { enabled: true, plans: ['pro', 'elite', 'growth', 'scale', 'agency_starter', 'agency_pro', 'agency_enterprise'] },
  direct_email_send: { enabled: true, plans: ['pro', 'elite', 'growth', 'scale', 'agency_starter', 'agency_pro', 'agency_enterprise'] },
  custom_reports: { enabled: true, plans: ['pro', 'elite', 'scale', 'agency_pro', 'agency_enterprise'] },
  api_access: { enabled: true, plans: ['elite', 'enterprise', 'agency_enterprise'] },
};

export function isFeatureEnabled(featureName, userPlan) {
  const flag = FLAGS[featureName];
  if (!flag || !flag.enabled) return false;
  if (!flag.plans) return true; // no plan restriction
  return flag.plans.includes(userPlan);
}

export function getAvailableFeatures(userPlan) {
  return Object.entries(FLAGS)
    .filter(([_, flag]) => flag.enabled && (!flag.plans || flag.plans.includes(userPlan)))
    .map(([name]) => name);
}
