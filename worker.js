const H = { 'content-type': 'application/json', 'cache-control': 'no-store' };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/data') {
      if (request.method === 'GET') {
        const v = await env.MARATHON.get('data');
        return new Response(v || 'null', { headers: H });
      }
      if (request.method === 'POST') {
        if (!env.ADMIN_PASSWORD || request.headers.get('authorization') !== 'Bearer ' + env.ADMIN_PASSWORD) {
          return new Response('unauthorized', { status: 401 });
        }
        const body = await request.text();
        if (!body) return new Response('ok');
        if (body.length > 800000) return new Response('too large', { status: 413 });
        try { JSON.parse(body); } catch (e) { return new Response('bad json', { status: 400 }); }
        await env.MARATHON.put('data', body);
        return new Response('ok');
      }
      return new Response('method not allowed', { status: 405 });
    }
    return env.ASSETS.fetch(request);
  }
};
