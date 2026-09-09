import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId } = await req.json();

    if (!customerId) {
      return Response.json({ invoices: [] });
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

    return Response.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});