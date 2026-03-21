export const config = { runtime: 'edge' };

export default function handler() {
  return Response.json({ status: 'ok', version: '1.0.0' });
}
