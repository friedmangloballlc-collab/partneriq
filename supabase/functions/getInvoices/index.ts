import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { customerId } = await req.json();

    if (!customerId) {
      return new Response(JSON.stringify({ invoices: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const stripe = await import('npm:stripe@14.11.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const invoices = await stripeClient.invoices.list({
      customer: customerId,
      limit: 50,
    });

    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      date: invoice.created * 1000, // Convert Unix timestamp to ms
      amount: invoice.total,
      status: invoice.status || 'draft',
      pdf_url: invoice.pdf,
      period_start: invoice.period_start * 1000,
      period_end: invoice.period_end * 1000,
    }));

    return new Response(JSON.stringify({ invoices: formattedInvoices }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});