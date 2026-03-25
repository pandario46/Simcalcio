import { neon } from "@neondatabase/serverless";

export default async (req) => {
  try {
    const sql = neon(Netlify.env.get("NETLIFY_DATABASE_URL"));
    const url = new URL(req.url);
    const session_id = url.searchParams.get("session_id");

    if (!session_id) {
      return Response.json({ error: "session_id is required" }, { status: 400 });
    }

    const rows = await sql`
      SELECT home_name, away_name, home_goals, away_goals, simulated_at
      FROM match_simulations
      WHERE session_id = ${session_id}
      ORDER BY simulated_at DESC
      LIMIT 10
    `;

    return Response.json({ rows });
  } catch (err) {
    console.error("match-history error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
