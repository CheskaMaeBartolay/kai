export default async function handler(request, response) {
  const userId = Number(new URL(request.url, `https://${request.headers.host}`).searchParams.get("userId")) || 8685718614;

  try {
    const robloxResponse = await fetch("https://presence.roblox.com/v1/presence/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: [userId] })
    });

    const data = await robloxResponse.json();
    return response.status(robloxResponse.status).json(data);
  } catch {
    return response.status(500).json({ error: "Unable to retrieve Roblox presence" });
  }
}
