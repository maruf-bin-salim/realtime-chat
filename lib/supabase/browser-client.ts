import { createBrowserClient } from "@supabase/ssr";

const URL = 'https://tspfpjkghxfjcpklduuv.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcGZwamtnaHhmamNwa2xkdXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxNTgwNjMsImV4cCI6MjAzMDczNDA2M30.g6UmVnezKAGQmYeTJ0jy9Gm4jqM1gy5xUBcggf6_cP8';

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    URL,
    ANON_KEY
  );
}
