
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if OpenAI API key is set
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const ASSISTANT_ID = Deno.env.get('ASSISTANT_ID');
    
    console.log("Checking OpenAI API configuration...");
    
    // Basic validation
    if (!OPENAI_API_KEY) {
      console.log("OPENAI_API_KEY is not set");
      return new Response(JSON.stringify({ 
        configured: false, 
        error: 'Missing API key',
        details: 'OpenAI API key is not configured in Supabase Edge Functions Secrets'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    if (!ASSISTANT_ID) {
      console.log("ASSISTANT_ID is not set");
      return new Response(JSON.stringify({ 
        configured: false, 
        error: 'Missing Assistant ID',
        details: 'OpenAI Assistant ID is not configured in Supabase Edge Functions Secrets'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Let's validate the API key and Assistant ID by making a simple request to OpenAI
    try {
      console.log("Validating OpenAI API key and Assistant ID...");
      const assistantResponse = await fetch(`https://api.openai.com/v1/assistants/${ASSISTANT_ID}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v1",
          "Content-Type": "application/json"
        }
      });
      
      const assistantData = await assistantResponse.json();
      
      if (assistantResponse.ok) {
        console.log("OpenAI API key and Assistant ID are valid");
        return new Response(JSON.stringify({ 
          configured: true,
          assistantName: assistantData.name,
          assistantModel: assistantData.model
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } else {
        console.error("Error validating assistant:", assistantData);
        return new Response(JSON.stringify({ 
          configured: false, 
          error: 'Invalid configuration',
          details: assistantData.error?.message || 'Failed to validate OpenAI Assistant configuration'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } catch (validationError) {
      console.error("Error validating OpenAI configuration:", validationError);
      return new Response(JSON.stringify({ 
        configured: false, 
        error: 'Validation error',
        details: 'Failed to connect to OpenAI API to validate configuration'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Unexpected error checking assistant status:", error);
    return new Response(JSON.stringify({ 
      configured: false, 
      error: 'Unexpected error',
      details: error.message || 'An unexpected error occurred while checking assistant status'
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
