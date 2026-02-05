import fetch from "node-fetch";

export async function postJobUpdate({ callbackUrl, internalKey, body }) {
  const res = await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${internalKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Callback failed: ${res.status} ${text}`);
  }
}
