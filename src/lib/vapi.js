// Voice IDs from Vapi's voice library — swap these for your preferred voices
// Browse available voices at: dashboard.vapi.ai > Phone calls > Assistant > Voice
const VOICE_IDS = {
  female: "jennifer-playht",  // warm, friendly
  male: "ryan-playht",        // deep, confident
};

// Fires a Vapi outbound call and returns the Vapi call ID
export async function placeVapiCall(params) {
  const { callerName, recipientName, recipientPhone, voice, instructions, internalCallId } = params;

  const recipientIntro = recipientName
    ? `You are speaking with ${recipientName}.`
    : "You don't know the recipient's name yet — greet them politely.";

  const systemPrompt = `
You are an AI assistant making an outbound phone call on behalf of ${callerName}.

${recipientIntro}

Your task: ${instructions}

Guidelines:
- Introduce yourself as calling on behalf of ${callerName}.
- Be polite, clear, and concise.
- Do not make up information you were not given.
- If the call reaches voicemail, leave a brief message summarising the purpose of the call and ask them to call ${callerName} back.
- End the call politely once the task is complete.
  `.trim();

  const res = await fetch("https://api.vapi.ai/call/phone", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      customer: {
        number: recipientPhone,
        ...(recipientName ? { name: recipientName } : {}),
      },
      assistant: {
        voice: {
          provider: "playht",
          voiceId: VOICE_IDS[voice],
        },
        firstMessage: `Hi, I'm calling on behalf of ${callerName}. Am I speaking with ${recipientName || "the right person"}?`,
        model: {
          provider: "anthropic",
          model: "claude-haiku-4-5-20251001",
          systemPrompt,
        },
        endCallFunctionEnabled: true,
        recordingEnabled: true,
      },
      metadata: {
        internalCallId, // echoed back in webhook payload for matching
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vapi API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.id;
}