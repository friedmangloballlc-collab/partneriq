import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [partnerships, talents, emails, approvals] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 300),
      base44.entities.Talent.list('-created_date', 200),
      base44.entities.OutreachEmail.list('-created_date', 200),
      base44.entities.ApprovalItem.list('-created_date', 100),
    ]);

    if (partnerships.length === 0) {
      return Response.json({ error: 'No partnership data found.' }, { status: 400 });
    }

    const activeDeals = partnerships.filter(p => ['active', 'contracted'].includes(p.status));
    const platformBreakdown = {};
    talents.forEach(t => { if (t.platform) platformBreakdown[t.platform] = (platformBreakdown[t.platform] || 0) + 1; });
    const regionBreakdown = {};
    activeDeals.forEach(d => {
      const region = d.region || 'United States';
      regionBreakdown[region] = (regionBreakdown[region] || 0) + 1;
    });

    const prompt = `You are a Compliance & Disclosure AI Agent for influencer marketing partnerships.

PARTNERSHIP DATA:
- Active partnerships: ${activeDeals.length}
- Total historical: ${partnerships.length}
- Platform distribution: ${JSON.stringify(platformBreakdown)}
- Region distribution: ${JSON.stringify(regionBreakdown)}

ACTIVE DEALS:
${activeDeals.slice(0, 15).map(d => `- ${d.talent_name || 'Creator'} × ${d.brand_name || 'Brand'}: Type=${d.partnership_type || 'N/A'}, Platform=${d.platform || 'Multi'}`).join('\n')}

APPROVAL WORKFLOW:
- Pending approvals: ${approvals.filter(a => a.status === 'pending').length}
- Approved: ${approvals.filter(a => a.status === 'approved').length}
- Rejected: ${approvals.filter(a => a.status === 'rejected').length}

Perform comprehensive compliance analysis:
1. FTC disclosure requirements for each partnership type
2. Platform-specific disclosure rules (Instagram, TikTok, YouTube, etc.)
3. International compliance requirements (ASA, EU regulations)
4. Content usage rights compliance audit
5. Disclosure monitoring checklist
6. Compliance risk scoring for active partnerships
7. Auto-generated compliance reports for legal teams`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          overall_compliance_score: { type: 'string' },
          compliance_grade: { type: 'string' },
          ftc_requirements: {
            type: 'array',
            items: { type: 'object', properties: { partnership_type: { type: 'string' }, required_disclosures: { type: 'string' }, placement_rules: { type: 'string' }, common_violations: { type: 'string' } } }
          },
          platform_rules: {
            type: 'array',
            items: { type: 'object', properties: { platform: { type: 'string' }, disclosure_format: { type: 'string' }, branded_content_tools: { type: 'string' }, prohibited_practices: { type: 'string' }, compliance_tip: { type: 'string' } } }
          },
          international_requirements: {
            type: 'array',
            items: { type: 'object', properties: { jurisdiction: { type: 'string' }, regulation: { type: 'string' }, key_requirements: { type: 'string' }, penalties: { type: 'string' } } }
          },
          usage_rights_audit: {
            type: 'array',
            items: { type: 'object', properties: { area: { type: 'string' }, status: { type: 'string' }, risk: { type: 'string' }, action_needed: { type: 'string' } } }
          },
          partnership_compliance_scores: {
            type: 'array',
            items: { type: 'object', properties: { partnership: { type: 'string' }, compliance_score: { type: 'string' }, issues_found: { type: 'string' }, remediation: { type: 'string' } } }
          },
          monitoring_checklist: {
            type: 'array',
            items: { type: 'object', properties: { check_item: { type: 'string' }, frequency: { type: 'string' }, responsible_party: { type: 'string' }, automated: { type: 'string' } } }
          },
          top_3_actions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({ success: true, analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
