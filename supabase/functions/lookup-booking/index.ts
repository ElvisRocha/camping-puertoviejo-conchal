import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { referenceCode } = await req.json();

    if (!referenceCode || typeof referenceCode !== "string") {
      return new Response(
        JSON.stringify({ error: "referenceCode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const code = referenceCode.trim().toUpperCase();

    // Fetch booking by reference_code
    const { data: bookings, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("reference_code", code)
      .limit(1);

    if (bookingError) {
      return new Response(
        JSON.stringify({ error: bookingError.message, errorType: "general" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ error: "not_found", errorType: "not_found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const booking = bookings[0];

    if (booking.status === "cancelled") {
      return new Response(
        JSON.stringify({ error: "cancelled", errorType: "cancelled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch related data in parallel using service role (bypasses RLS)
    const [tentsResult, addonsResult, guestInfoResult] = await Promise.all([
      supabase.from("booking_tents").select("*").eq("booking_id", booking.id),
      supabase.from("booking_addons").select("*").eq("booking_id", booking.id),
      supabase.from("guest_info").select("*").eq("booking_id", booking.id).maybeSingle(),
    ]);

    return new Response(
      JSON.stringify({
        booking,
        tents: tentsResult.data || [],
        addons: addonsResult.data || [],
        guestInfo: guestInfoResult.data || null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message, errorType: "general" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
