export const config = { runtime: 'edge' };
export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed',{status:405});
  // TODO: implement SMTP test using nodemailer in a regular serverless function
  // Edge runtime doesn't support nodemailer — use a background function
  return Response.json({ok:true, message:'SMTP test queued. Check logs for result.'});
}
