import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    const { sequence_id } = await req.json();
    if (!sequence_id) {
      return new Response(JSON.stringify({ error: 'Missing required field: sequence_id' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the sequence
    const { data: sequence, error: seqError } = await base44.supabase
      .from('outreach_sequences')
      .select('*')
      .eq('id', sequence_id)
      .single();

    if (seqError || !sequence) {
      return new Response(JSON.stringify({ error: 'Sequence not found' }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark sequence as active
    await base44.supabase
      .from('outreach_sequences')
      .update({ status: 'active' })
      .eq('id', sequence_id);

    // Fetch all pending (draft/scheduled) emails in this sequence
    const { data: emails, error: emailsError } = await base44.supabase
      .from('outreach_emails')
      .select('*')
      .eq('sequence_id', sequence_id)
      .in('status', ['draft', 'scheduled'])
      .order('created_at', { ascending: true });

    if (emailsError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch emails', details: emailsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!emails || emails.length === 0) {
      // No pending emails -- mark sequence completed
      await base44.supabase
        .from('outreach_sequences')
        .update({ status: 'completed' })
        .eq('id', sequence_id);

      return new Response(JSON.stringify({
        success: true,
        message: 'No pending emails in this sequence',
        sent: 0,
        failed: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'deals@thedealstage.com';

    const results: { email_id: string; status: 'sent' | 'failed'; error?: string; resend_id?: string }[] = [];
    let sentCount = 0;

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      // Rate limit: wait 1 second between sends (skip before first)
      if (i > 0) {
        await sleep(1000);
      }

      if (!email.recipient_email) {
        results.push({ email_id: email.id, status: 'failed', error: 'Missing recipient_email' });
        continue;
      }

      try {
        const resendResp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email.recipient_email],
            subject: email.subject || '(No subject)',
            html: email.body || '',
          }),
        });

        const resendData = await resendResp.json();

        if (!resendResp.ok) {
          results.push({
            email_id: email.id,
            status: 'failed',
            error: resendData?.message || `Resend returned ${resendResp.status}`,
          });
          continue;
        }

        // Update email status
        const sentAt = new Date().toISOString();
        await base44.supabase
          .from('outreach_emails')
          .update({ status: 'sent', sent_at: sentAt })
          .eq('id', email.id);

        // Log activity
        try {
          await base44.supabase.from('activities').insert({
            type: 'email_sent',
            description: `Bulk outreach email sent to ${email.recipient_name || email.recipient_email}: "${email.subject}"`,
            entity_type: 'outreach_email',
            entity_id: email.id,
            partnership_id: email.partnership_id || null,
            user_id: user.id,
            user_name: user.full_name || user.email,
            metadata: JSON.stringify({
              resend_id: resendData.id,
              recipient_email: email.recipient_email,
              recipient_name: email.recipient_name,
              subject: email.subject,
              sequence_id,
              bulk: true,
            }),
          });
        } catch (activityErr) {
          console.error('[sendBulkOutreach] Failed to log activity for email', email.id, (activityErr as Error).message);
        }

        sentCount++;
        results.push({ email_id: email.id, status: 'sent', resend_id: resendData.id });

      } catch (sendErr) {
        results.push({
          email_id: email.id,
          status: 'failed',
          error: (sendErr as Error).message,
        });
      }
    }

    // Update sequence counters and status
    const failedCount = results.filter(r => r.status === 'failed').length;
    const newSentCount = (sequence.sent_count || 0) + sentCount;

    const sequenceUpdate: Record<string, any> = {
      sent_count: newSentCount,
    };

    // Check if there are remaining unsent emails in the sequence
    const { count: remainingCount } = await base44.supabase
      .from('outreach_emails')
      .select('id', { count: 'exact', head: true })
      .eq('sequence_id', sequence_id)
      .in('status', ['draft', 'scheduled']);

    if (remainingCount === 0 || remainingCount === null) {
      sequenceUpdate.status = 'completed';
    }

    await base44.supabase
      .from('outreach_sequences')
      .update(sequenceUpdate)
      .eq('id', sequence_id);

    // Log a summary activity for the bulk send
    try {
      await base44.supabase.from('activities').insert({
        type: 'bulk_outreach_sent',
        description: `Bulk outreach completed for sequence "${sequence.name}": ${sentCount} sent, ${failedCount} failed`,
        entity_type: 'outreach_sequence',
        entity_id: sequence_id,
        user_id: user.id,
        user_name: user.full_name || user.email,
        metadata: JSON.stringify({
          sequence_id,
          sequence_name: sequence.name,
          total_attempted: emails.length,
          sent: sentCount,
          failed: failedCount,
        }),
      });
    } catch (activityErr) {
      console.error('[sendBulkOutreach] Failed to log summary activity:', (activityErr as Error).message);
    }

    return new Response(JSON.stringify({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: emails.length,
      sequence_status: sequenceUpdate.status || 'active',
      results,
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
