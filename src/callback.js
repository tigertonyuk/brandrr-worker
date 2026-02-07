import fetch from "node-fetch";
export async function postJobUpdate({ callbackUrl, internalKey, body }) {
  await fetch(callbackUrl, {
    method: "POST",
    headers: { "content-type":"application/json","authorization":`Bearer ${internalKey}` },
    body: JSON.stringify(body)
  });
}