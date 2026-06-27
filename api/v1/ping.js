export const config = { runtime: 'edge' };
export default async function handler() {
  return Response.json({ ok: true, message: 'CarsaiPlay API online', version: '1.0.0' });
}
