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

    const { standardCode } = await req.json();

    // Get standard by code
    const { data: standard, error: standardError } = await supabaseClient
      .from('standards')
      .select('id, is_free')
      .eq('code', standardCode)
      .maybeSingle();

    if (standardError) {
      console.error('Error fetching standard:', standardError);
      return new Response(JSON.stringify({ 
        hasAccess: false,
        error: 'Error fetching standard' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!standard) {
      return new Response(JSON.stringify({ 
        hasAccess: false,
        error: 'Standard not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Free standards are always accessible
    if (standard.is_free) {
      return new Response(
        JSON.stringify({ 
          hasAccess: true,
          accessType: 'free',
          expiryDate: null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check user access
    const { data: access, error: accessError } = await supabaseClient
      .from('user_standard_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('standard_id', standard.id)
      .eq('is_active', true)
      .maybeSingle();

    if (accessError) {
      console.error('Error checking access:', accessError);
      return new Response(
        JSON.stringify({ 
          hasAccess: false,
          accessType: null,
          expiryDate: null,
          error: 'Error checking access'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!access) {
      return new Response(
        JSON.stringify({ 
          hasAccess: false,
          accessType: null,
          expiryDate: null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if subscription expired
    if (access.expiry_date) {
      const now = new Date();
      const expiryDate = new Date(access.expiry_date);
      
      if (expiryDate <= now) {
        return new Response(
          JSON.stringify({ 
            hasAccess: false,
            accessType: access.access_type,
            expiryDate: access.expiry_date,
            expired: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        hasAccess: true,
        accessType: access.access_type,
        expiryDate: access.expiry_date
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in validate-standard-access:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
