import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceRuleInput {
  title: string;
  value_type: 'percentage' | 'fixed_amount';
  value: string;
  customer_selection?: string;
  target_type?: string;
  target_selection?: string;
  allocation_method?: string;
  prerequisite_subtotal?: string;
  starts_at?: string;
  ends_at?: string;
  once_per_customer?: boolean;
  usage_limit?: number;
}

interface DiscountCodeInput {
  code: string;
  usage_count?: number;
}

interface ProductInput {
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  variants?: Array<{
    id?: number;
    price?: string;
    compare_at_price?: string | null;
    sku?: string;
    option1?: string;
    option2?: string;
    option3?: string;
  }>;
  images?: Array<{ src: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: hasAdminRole } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (!hasAdminRole) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/shopify-admin')[1] || '/';
    const method = req.method;

    const SHOPIFY_STORE_DOMAIN = Deno.env.get('SHOPIFY_STORE_PERMANENT_DOMAIN') || 'soft-silks-shop-hruls.myshopify.com';
    const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    const SHOPIFY_API_VERSION = '2025-07';

    if (!SHOPIFY_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Shopify access token not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const shopifyAdminUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}`;

    // ============ PRODUCTS ROUTES ============

    if (path === '/products' && method === 'GET') {
      // List products
      console.log('Fetching products from Shopify...');
      const response = await fetch(`${shopifyAdminUrl}/products.json?limit=250`, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log(`Fetched ${data.products?.length || 0} products`);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/products' && method === 'POST') {
      // Create product
      const body: ProductInput = await req.json();
      console.log('Creating product:', body.title);

      const productData = {
        product: {
          title: body.title,
          body_html: body.body_html || '',
          vendor: body.vendor || 'Бесценки',
          product_type: body.product_type || '',
          tags: body.tags || '',
          variants: body.variants || [{ price: '0', compare_at_price: null }],
          images: body.images || [],
        },
      };

      const response = await fetch(`${shopifyAdminUrl}/products.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Shopify error:', data);
        return new Response(JSON.stringify({ error: data.errors || 'Failed to create product' }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Product created:', data.product?.id);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.match(/^\/products\/\d+$/) && method === 'GET') {
      // Get specific product
      const productId = path.split('/')[2];
      console.log('Fetching product:', productId);
      
      const response = await fetch(`${shopifyAdminUrl}/products/${productId}.json`, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.match(/^\/products\/\d+$/) && method === 'PUT') {
      // Update product
      const productId = path.split('/')[2];
      const body: ProductInput = await req.json();
      console.log('Updating product:', productId);

      const productData = {
        product: {
          id: parseInt(productId),
          title: body.title,
          body_html: body.body_html,
          vendor: body.vendor,
          product_type: body.product_type,
          tags: body.tags,
          variants: body.variants,
          images: body.images,
        },
      };

      const response = await fetch(`${shopifyAdminUrl}/products/${productId}.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Shopify error:', data);
        return new Response(JSON.stringify({ error: data.errors || 'Failed to update product' }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Product updated:', productId);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.match(/^\/products\/\d+$/) && method === 'DELETE') {
      // Delete product
      const productId = path.split('/')[2];
      console.log('Deleting product:', productId);
      
      const response = await fetch(`${shopifyAdminUrl}/products/${productId}.json`, {
        method: 'DELETE',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Shopify error:', data);
        return new Response(JSON.stringify({ error: data.errors || 'Failed to delete product' }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Product deleted:', productId);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============ PRICE RULES ROUTES ============

    if (path === '/price-rules' && method === 'GET') {
      // List price rules
      const response = await fetch(`${shopifyAdminUrl}/price_rules.json`, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/price-rules' && method === 'POST') {
      // Create price rule
      const body: PriceRuleInput = await req.json();

      const priceRule = {
        price_rule: {
          title: body.title,
          value_type: body.value_type,
          value: body.value,
          customer_selection: body.customer_selection || 'all',
          target_type: body.target_type || 'line_item',
          target_selection: body.target_selection || 'all',
          allocation_method: body.allocation_method || 'across',
          starts_at: body.starts_at || null,
          ends_at: body.ends_at || null,
          once_per_customer: body.once_per_customer || false,
          usage_limit: body.usage_limit || null,
          ...(body.prerequisite_subtotal && {
            prerequisite_subtotal_range: {
              greater_than_or_equal_to: body.prerequisite_subtotal,
            },
          }),
        },
      };

      const response = await fetch(`${shopifyAdminUrl}/price_rules.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priceRule),
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.match(/^\/price-rules\/\d+$/) && method === 'GET') {
      // Get specific price rule
      const priceRuleId = path.split('/')[2];
      const response = await fetch(`${shopifyAdminUrl}/price_rules/${priceRuleId}.json`, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.match(/^\/price-rules\/\d+$/) && method === 'PUT') {
      // Update price rule
      const priceRuleId = path.split('/')[2];
      const body: Partial<PriceRuleInput> = await req.json();

      const priceRule = {
        price_rule: body,
      };

      const response = await fetch(`${shopifyAdminUrl}/price_rules/${priceRuleId}.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priceRule),
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.match(/^\/price-rules\/\d+$/) && method === 'DELETE') {
      // Delete price rule
      const priceRuleId = path.split('/')[2];
      const response = await fetch(`${shopifyAdminUrl}/price_rules/${priceRuleId}.json`, {
        method: 'DELETE',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.match(/^\/price-rules\/\d+\/discount-codes$/) && method === 'GET') {
      // List discount codes for a price rule
      const priceRuleId = path.split('/')[2];
      const response = await fetch(
        `${shopifyAdminUrl}/price_rules/${priceRuleId}/discount_codes.json`,
        {
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.match(/^\/price-rules\/\d+\/discount-codes$/) && method === 'POST') {
      // Create discount code
      const priceRuleId = path.split('/')[2];
      const body: DiscountCodeInput = await req.json();

      const discountCode = {
        discount_code: {
          code: body.code,
        },
      };

      const response = await fetch(
        `${shopifyAdminUrl}/price_rules/${priceRuleId}/discount_codes.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(discountCode),
        }
      );

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.match(/^\/price-rules\/\d+\/discount-codes\/\d+$/) && method === 'DELETE') {
      // Delete discount code
      const pathParts = path.split('/');
      const priceRuleId = pathParts[2];
      const discountCodeId = pathParts[4];

      const response = await fetch(
        `${shopifyAdminUrl}/price_rules/${priceRuleId}/discount_codes/${discountCodeId}.json`,
        {
          method: 'DELETE',
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in shopify-admin function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
