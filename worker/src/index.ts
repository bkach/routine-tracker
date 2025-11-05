export interface Env {
  WORKOUTS: KVNamespace;
}

// Generate a short random slug (4-6 characters, lowercase alphanumeric)
function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * 3) + 4; // 4-6 chars
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // POST /new - Create new workout with slug
    if (request.method === 'POST' && url.pathname === '/new') {
      try {
        const yamlText = await request.text();

        // Validate size (max 20KB)
        if (yamlText.length > 20 * 1024) {
          return new Response(
            JSON.stringify({ error: 'Workout too large (max 20KB)' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Basic validation
        if (!yamlText.trim()) {
          return new Response(
            JSON.stringify({ error: 'Empty workout' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Generate unique slug
        let slug = generateSlug();
        let attempts = 0;
        while (await env.WORKOUTS.get(slug)) {
          slug = generateSlug();
          attempts++;
          if (attempts > 10) {
            return new Response(
              JSON.stringify({ error: 'Failed to generate unique slug' }),
              {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
        }

        // Store workout
        await env.WORKOUTS.put(slug, yamlText);

        return new Response(
          JSON.stringify({ slug }),
          {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to save workout' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // GET /s/:slug - Retrieve workout by slug
    if (request.method === 'GET' && url.pathname.startsWith('/s/')) {
      const slug = url.pathname.slice(3); // Remove '/s/'

      if (!slug) {
        return new Response('Slug required', {
          status: 400,
          headers: corsHeaders,
        });
      }

      try {
        const yamlText = await env.WORKOUTS.get(slug);

        if (!yamlText) {
          return new Response('Workout not found', {
            status: 404,
            headers: corsHeaders,
          });
        }

        return new Response(yamlText, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        });
      } catch (error) {
        return new Response('Failed to retrieve workout', {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // 404 for other routes
    return new Response('Not found', {
      status: 404,
      headers: corsHeaders,
    });
  },
};
