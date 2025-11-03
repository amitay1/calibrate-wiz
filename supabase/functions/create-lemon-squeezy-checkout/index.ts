import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const { standardId, priceType } = await req.json();

    // Get standard details
    const { data: standard, error: standardError } = await supabaseClient
      .from('standards')
      .select('*')
      .eq('id', standardId)
      .maybeSingle();

    if (standardError) {
      console.error('Error fetching standard:', standardError);
      return new Response(JSON.stringify({ error: 'Error fetching standard' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!standard) {
      console.error('Standard not found:', standardId);
      return new Response(JSON.stringify({ error: 'Standard not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the appropriate variant ID based on price type
    let variantId;
    let price;
    switch (priceType) {
      case 'one_time':
        variantId = standard.lemon_squeezy_variant_id_onetime;
        price = standard.price_one_time;
        break;
      case 'monthly':
        variantId = standard.lemon_squeezy_variant_id_monthly;
        price = standard.price_monthly;
        break;
      case 'annual':
        variantId = standard.lemon_squeezy_variant_id_annual;
        price = standard.price_annual;
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid price type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (!variantId) {
      return new Response(JSON.stringify({ error: 'Price type not available for this standard' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Lemon Squeezy checkout
    const lemonSqueezyResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${Deno.env.get('LEMON_SQUEEZY_API_KEY')}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: user.email,
              custom: {
                user_id: user.id,
                standard_id: standardId,
                price_type: priceType,
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: Deno.env.get('LEMON_SQUEEZY_STORE_ID'),
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          },
        },
      }),
    });

    const checkoutData = await lemonSqueezyResponse.json();
    
    if (!lemonSqueezyResponse.ok) {
      console.error('Lemon Squeezy error:', checkoutData);
      return new Response(JSON.stringify({ error: 'Failed to create checkout' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Checkout created successfully for user:', user.id);

    return new Response(
      JSON.stringify({ 
        checkoutUrl: checkoutData.data.attributes.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-lemon-squeezy-checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
