
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the OpenAI API key and Assistant ID from environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ASSISTANT_ID = Deno.env.get('ASSISTANT_ID');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if OpenAI API key is set
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      throw new Error("OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.");
    }
    
    // Check if Assistant ID is set
    if (!ASSISTANT_ID) {
      console.error("ASSISTANT_ID is not set");
      throw new Error("OpenAI Assistant ID is not configured. Please set the ASSISTANT_ID environment variable.");
    }

    console.log("Environment variables validated successfully");

    const reqData = await req.json();
    const message = reqData.message;
    
    if (!message) {
      throw new Error("No message provided in the request body");
    }
    
    console.log("User message:", message);

    // Step 1: Create a Thread
    console.log("Creating thread...");
    const threadResponse = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({})
    });

    if (!threadResponse.ok) {
      const error = await threadResponse.json();
      console.error("Thread creation error:", error);
      throw new Error(`Failed to create thread: ${error.error?.message || JSON.stringify(error)}`);
    }

    const threadData = await threadResponse.json();
    const threadId = threadData.id;
    console.log("Thread created with ID:", threadId);

    // Step 2: Add a Message to the Thread
    console.log("Adding message to thread...");
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({
        role: "user",
        content: message
      })
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.json();
      console.error("Message creation error:", error);
      throw new Error(`Failed to create message: ${error.error?.message || JSON.stringify(error)}`);
    }

    console.log("Message added to thread");

    // Step 3: Run the Assistant
    console.log("Running the assistant...");
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID
      })
    });

    if (!runResponse.ok) {
      const error = await runResponse.json();
      console.error("Run creation error:", error);
      throw new Error(`Failed to create run: ${error.error?.message || JSON.stringify(error)}`);
    }

    const runData = await runResponse.json();
    const runId = runData.id;
    console.log("Run created with ID:", runId);

    // Step 4: Periodically check the Run status
    let runStatus = runData.status;
    let responseMessage = null;
    let attempts = 0;
    const maxAttempts = 60; // Increased max attempts to give more time
    const delay = 1000; // 1 second delay between checks

    while (runStatus !== "completed" && runStatus !== "failed" && runStatus !== "cancelled" && attempts < maxAttempts) {
      // Wait a moment before checking again
      console.log(`Checking run status (attempt ${attempts + 1})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempts++;

      // Check the status
      const runCheckResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v1"
        }
      });

      if (!runCheckResponse.ok) {
        const error = await runCheckResponse.json();
        console.error("Run check error:", error);
        throw new Error(`Failed to check run status: ${error.error?.message || JSON.stringify(error)}`);
      }

      const runCheckData = await runCheckResponse.json();
      runStatus = runCheckData.status;
      console.log("Current run status:", runStatus);
      
      // If the run requires action, we can handle that here
      if (runStatus === "requires_action") {
        console.log("Run requires action:", runCheckData.required_action);
        // This is a simplified handling - in a real app, you'd want to handle this properly
        runStatus = "failed";
        throw new Error("Run requires action which is not supported in this implementation");
      }
    }

    if (runStatus !== "completed") {
      console.error(`Run ended with non-completed status: ${runStatus}`);
      throw new Error(`Run ended with status: ${runStatus}. The process timed out or failed.`);
    }

    // Step 5: Retrieve the Messages added by the Assistant
    console.log("Retrieving assistant messages...");
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v1"
      }
    });

    if (!messagesResponse.ok) {
      const error = await messagesResponse.json();
      console.error("Messages retrieval error:", error);
      throw new Error(`Failed to retrieve messages: ${error.error?.message || JSON.stringify(error)}`);
    }

    const messagesData = await messagesResponse.json();
    
    // Get the latest assistant message
    const assistantMessages = messagesData.data.filter(msg => msg.role === "assistant");
    const latestMessage = assistantMessages[0];
    
    if (latestMessage) {
      // Extract the text content from all content parts
      responseMessage = latestMessage.content
        .filter(content => content.type === "text")
        .map(content => content.text.value)
        .join("\n");
      
      console.log("Successfully retrieved assistant response");
    } else {
      console.error("No assistant message found in the response");
      throw new Error("No assistant message found in the response");
    }

    console.log("Assistant response ready to return");

    return new Response(JSON.stringify({ response: responseMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error:", error.message, error.stack);
    
    // Provide a more detailed error message
    let errorMessage = error.message;
    let details = "An error occurred while processing your request to the OpenAI Assistant API.";
    
    // Determine if this is an environment variable issue
    if (errorMessage.includes("OPENAI_API_KEY") || errorMessage.includes("ASSISTANT_ID")) {
      details = "Missing required environment variables. Please ensure OPENAI_API_KEY and ASSISTANT_ID are set in Supabase Edge Functions Secrets.";
    }
    
    // Network or API error
    if (errorMessage.includes("Failed to fetch")) {
      details = "Failed to connect to OpenAI API. This could be due to network issues or rate limiting.";
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: details 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
