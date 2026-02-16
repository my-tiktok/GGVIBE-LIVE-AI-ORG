export async function GET() {
  const token = process.env.OPENAI_APPS_CHALLENGE_TOKEN || '';
  return new Response(token, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
