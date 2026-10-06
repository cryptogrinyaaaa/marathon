// Cloudflare Pages Function: GET — публічне читання, POST — запис (потрібен пароль).
const H = { 'content-type': 'application/json', 'cache-control': 'no-store' };

export async function onRequestGet({ env }) {
  const v = await env.MARATHON.get('data');
  return new Response(v || 'null', { headers: H });
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || request.headers.get('authorization') !== 'Bearer ' + env.ADMIN_PASSWORD) {
    return new Response('unauthorized', { status: 401 });
  }
  const body = await request.text();
  if (!body) return new Response('ok'); // перевірка пароля при вході
  if (body.length > 800000) return new Response('too large', { status: 413 });
  try { JSON.parse(body); } catch (e) { return new Response('bad json', { status: 400 }); }
  await env.MARATHON.put('data', body);
  return new Response('ok');
}
