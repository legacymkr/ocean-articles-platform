export async function GET() {
  // Railway health check - must respond quickly with 200
  console.log('[Health Check] Received health check request');
  console.log('[Health Check] PORT:', process.env.PORT);
  console.log('[Health Check] HOSTNAME:', process.env.HOSTNAME);
  
  try {
    const response = new Response("OK", {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'railway'
      }
    });
    
    console.log('[Health Check] Responding with 200 OK');
    return response;
  } catch (error) {
    console.error('[Health Check] Error:', error);
    // Still return 200 to pass Railway health check
    return new Response("OK", {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}
