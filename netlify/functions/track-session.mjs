import { neon } from "@neondatabase/serverless";

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  try {
    const sql = neon(Netlify.env.get("NETLIFY_DATABASE_URL"));
    const { session_id, user_agent } = await req.json();

    if (!session_id) {
      return Response.json({ error: "session_id is required" }, { status: 400 });
    }

    await sql`
      INSERT INTO sessions (session_id, user_agent, page_views)
      VALUES (${session_id}, ${user_agent || ""}, 1)
      ON CONFLICT (session_id)
      DO UPDATE SET last_seen = NOW(), page_views = sessions.page_views + 1
    `;

    return Response.json({ ok: true });
  } catch (err) {
    console.error("track-session error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
