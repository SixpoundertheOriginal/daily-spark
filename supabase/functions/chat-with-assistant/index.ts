
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
    // Validate that the API key and assistant ID are set
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    
    if (!ASSISTANT_ID) {
      throw new Error("ASSISTANT_ID is not set");
    }

    const { message } = await req.json();
    console.log("User message:", message);

    // Step 1: Create a Thread
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
      throw new Error(`Failed to create thread: ${error.error?.message || "Unknown error"}`);
    }

    const threadData = await threadResponse.json();
    const threadId = threadData.id;
    console.log("Thread created with ID:", threadId);

    // Step 2: Add a Message to the Thread
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
      throw new Error(`Failed to create message: ${error.error?.message || "Unknown error"}`);
    }

    console.log("Message added to thread");

    // Step 3: Run the Assistant
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
      throw new Error(`Failed to create run: ${error.error?.message || "Unknown error"}`);
    }

    const runData = await runResponse.json();
    const runId = runData.id;
    console.log("Run created with ID:", runId);

    // Step 4: Periodically check the Run status
    let runStatus = runData.status;
    let responseMessage = null;

    while (runStatus !== "completed" && runStatus !== "failed" && runStatus !== "cancelled") {
      // Wait a moment before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));

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
        throw new Error(`Failed to check run status: ${error.error?.message || "Unknown error"}`);
      }

      const runCheckData = await runCheckResponse.json();
      runStatus = runCheckData.status;
      console.log("Current run status:", runStatus);
    }

    if (runStatus !== "completed") {
      throw new Error(`Run ended with status: ${runStatus}`);
    }

    // Step 5: Retrieve the Messages added by the Assistant
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
      throw new Error(`Failed to retrieve messages: ${error.error?.message || "Unknown error"}`);
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
    }

    console.log("Assistant response:", responseMessage);

    return new Response(JSON.stringify({ response: responseMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
