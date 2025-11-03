import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's standard access
    const { data: accessData, error: accessError } = await supabaseClient
      .from('user_standard_access')
      .select(`
        *,
        standards (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (accessError) {
      console.error('Error fetching user standards:', accessError);
      throw accessError;
    }

    // Filter out expired subscriptions
    const now = new Date();
    const activeStandards = accessData?.filter(access => 
      !access.expiry_date || new Date(access.expiry_date) > now
    ) || [];

    const hasActiveSubscription = activeStandards.some(
      access => access.access_type === 'subscription'
    );

    return new Response(
      JSON.stringify({ 
        standards: activeStandards,
        has_active_subscription: hasActiveSubscription
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-user-standards:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
