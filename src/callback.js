import fetch from "node-fetch";

export async function postJobUpdate({ callbackUrl, internalKey, body }) {
  console.log(`Sending callback to: ${callbackUrl}`, body);
  
  const response = await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${internalKey}`,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  
  if (!response.ok) {
    console.error(`Callback failed: ${response.status}`, text);
    throw new Error(`Callback failed: ${response.status} - ${text}`);
  }
  
  console.log(`Callback succeeded: ${response.status}`, text);
  return text;
}
