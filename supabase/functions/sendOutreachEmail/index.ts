import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email_id } = await req.json();
    if (!email_id) {
      return new Response(JSON.stringify({ error: 'Missing required field: email_id' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the email record
    const { data: email, error: fetchError } = await base44.supabase
      .from('outreach_emails')
      .select('*')
      .eq('id', email_id)
      .single();

    if (fetchError || !email) {
      return new Response(JSON.stringify({ error: 'Email not found' }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (email.status === 'sent') {
      return new Response(JSON.stringify({ error: 'Email has already been sent' }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!email.recipient_email) {
      return new Response(JSON.stringify({ error: 'Email record is missing recipient_email' }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send via Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'deals@thedealstage.com';

    const resendPayload = {
      from: fromEmail,
      to: [email.recipient_email],
      subject: email.subject || '(No subject)',
      html: email.body || '',
    };

    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    });

    const resendData = await resendResp.json();

    if (!resendResp.ok) {
      // Update status to reflect failure without blocking retry
      await base44.supabase
        .from('outreach_emails')
        .update({ status: 'draft' })
        .eq('id', email_id);

      return new Response(JSON.stringify({
        error: 'Failed to send email via Resend',
        details: resendData,
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update email status to 'sent'
    const sentAt = new Date().toISOString();
    const { error: updateError } = await base44.supabase
      .from('outreach_emails')
      .update({ status: 'sent', sent_at: sentAt })
      .eq('id', email_id);

    if (updateError) {
      console.error('[sendOutreachEmail] Failed to update email status:', updateError.message);
    }

    // Log in activities table
    try {
      await base44.supabase.from('activities').insert({
        type: 'email_sent',
        description: `Outreach email sent to ${email.recipient_name || email.recipient_email}: "${email.subject}"`,
        entity_type: 'outreach_email',
        entity_id: email_id,
        partnership_id: email.partnership_id || null,
        user_id: user.id,
        user_name: user.full_name || user.email,
        metadata: JSON.stringify({
          resend_id: resendData.id,
          recipient_email: email.recipient_email,
          recipient_name: email.recipient_name,
          subject: email.subject,
          sequence_id: email.sequence_id || null,
        }),
      });
    } catch (activityErr) {
      console.error('[sendOutreachEmail] Failed to log activity:', (activityErr as Error).message);
    }

    return new Response(JSON.stringify({
      success: true,
      resend_id: resendData.id,
      email_id,
      sent_at: sentAt,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
