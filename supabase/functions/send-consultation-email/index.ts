import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { consultation_id } = await req.json();

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch consultation with patient and SOAP data
    const { data: consultation } = await supabase
      .from("consultations")
      .select(`
        *,
        patients(first_name, last_name),
        soap_notes(subjective, objective, assessment, plan)
      `)
      .eq("id", consultation_id)
      .single();

    if (!consultation) throw new Error("Consultation not found");

    // Get doctor's email
    const { data: userData } = await supabase.auth.admin.getUserById(consultation.doctor_id);
    const doctorEmail = userData?.user?.email;
    if (!doctorEmail) throw new Error("Doctor email not found");

    // Get doctor's profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", consultation.doctor_id)
      .single();

    const patientName = `${consultation.patients.first_name} ${consultation.patients.last_name}`;
    const soap = consultation.soap_notes;
    const doctorName = profile?.full_name || "Doctor";

    // Use Supabase's built-in email (via auth admin)
    // For production, integrate with a proper email service like Resend
    console.log(`Email notification for consultation ${consultation_id}:`);
    console.log(`To: ${doctorEmail}`);
    console.log(`Subject: Consultation Summary - ${patientName}`);
    console.log(`Body: SOAP note generated for ${patientName}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Email notification logged for ${doctorEmail}`,
      summary: {
        patient: patientName,
        doctor: doctorName,
        has_soap: !!soap,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
