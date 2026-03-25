import { neon } from "@neondatabase/serverless";

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  try {
    const sql = neon(Netlify.env.get("NETLIFY_DATABASE_URL"));
    const { matchday, teams } = await req.json();

    if (!matchday || !Array.isArray(teams) || teams.length === 0) {
      return Response.json({ error: "matchday and teams[] are required" }, { status: 400 });
    }

    for (const t of teams) {
      await sql`
        INSERT INTO standings_snapshots
          (matchday, team_abbr, team_name, points, wins, draws, losses, rank,
           xg_per_game, xga_per_game, ppda, shots_per_game, possession_pct,
           tackles_per_game, turnovers_per_game, block_style, title_pct, cl_spot_pct)
        VALUES
          (${matchday}, ${t.team_abbr}, ${t.team_name}, ${t.points}, ${t.wins},
           ${t.draws}, ${t.losses}, ${t.rank}, ${t.xg_per_game}, ${t.xga_per_game},
           ${t.ppda}, ${t.shots_per_game}, ${t.possession_pct}, ${t.tackles_per_game},
           ${t.turnovers_per_game}, ${t.block_style}, ${t.title_pct}, ${t.cl_spot_pct})
        ON CONFLICT (matchday, team_abbr) DO UPDATE SET
          points = ${t.points}, wins = ${t.wins}, draws = ${t.draws},
          losses = ${t.losses}, title_pct = ${t.title_pct}, cl_spot_pct = ${t.cl_spot_pct}
      `;
    }

    return Response.json({ ok: true, saved: teams.length });
  } catch (err) {
    console.error("save-standings error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
