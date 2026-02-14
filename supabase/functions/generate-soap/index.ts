import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcript, consultation_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a medical AI assistant that generates SOAP notes from clinical transcripts. 
You must extract structured clinical data and return it using the provided tools.
Be thorough, accurate, and use proper medical terminology.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a SOAP note and extract structured data from this clinical transcript:\n\n${transcript}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_soap_and_data",
              description: "Create a SOAP note and extracted structured data from a clinical transcript.",
              parameters: {
                type: "object",
                properties: {
                  soap: {
                    type: "object",
                    properties: {
                      subjective: { type: "string", description: "Patient's subjective complaints and history" },
                      objective: { type: "string", description: "Objective findings, vitals, exam results" },
                      assessment: { type: "string", description: "Clinical assessment and differential diagnoses" },
                      plan: { type: "string", description: "Treatment plan and follow-up" },
                    },
                    required: ["subjective", "objective", "assessment", "plan"],
                    additionalProperties: false,
                  },
                  structured_data: {
                    type: "object",
                    properties: {
                      symptoms: { type: "array", items: { type: "object", properties: { name: { type: "string" }, duration: { type: "string" }, severity: { type: "string" } }, required: ["name"] } },
                      medications: { type: "array", items: { type: "object", properties: { name: { type: "string" }, dosage: { type: "string" }, frequency: { type: "string" } }, required: ["name"] } },
                      vitals: { type: "object", properties: { blood_pressure: { type: "string" }, temperature: { type: "string" }, heart_rate: { type: "string" }, respiratory_rate: { type: "string" }, oxygen_saturation: { type: "string" } } },
                      diagnoses: { type: "array", items: { type: "object", properties: { name: { type: "string" }, certainty: { type: "string" } }, required: ["name"] } },
                      icd_codes: { type: "array", items: { type: "object", properties: { code: { type: "string" }, description: { type: "string" } }, required: ["code", "description"] } },
                    },
                    required: ["symptoms", "medications", "vitals", "diagnoses", "icd_codes"],
                    additionalProperties: false,
                  },
                },
                required: ["soap", "structured_data"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_soap_and_data" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", status, t);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const result = JSON.parse(toolCall.function.arguments);

    // Save to database if consultation_id provided
    if (consultation_id) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("soap_notes").upsert({
        consultation_id,
        subjective: result.soap.subjective,
        objective: result.soap.objective,
        assessment: result.soap.assessment,
        plan: result.soap.plan,
      }, { onConflict: "consultation_id" });

      await supabase.from("structured_data").upsert({
        consultation_id,
        symptoms: result.structured_data.symptoms,
        medications: result.structured_data.medications,
        vitals: result.structured_data.vitals,
        diagnoses: result.structured_data.diagnoses,
        icd_codes: result.structured_data.icd_codes,
      }, { onConflict: "consultation_id" });

      await supabase.from("consultations").update({ status: "completed" }).eq("id", consultation_id);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-soap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
