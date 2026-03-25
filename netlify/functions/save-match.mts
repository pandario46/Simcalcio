import { neon } from '@neondatabase/serverless';

const sql = neon(Netlify.env.get('NETLIFY_DATABASE_URL'));

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    const body = await req.json();
    const {
      session_id, home_abbr, away_abbr, home_name, away_name,
      home_goals, away_goals, home_win_pct, draw_pct, away_win_pct,
      home_ppda, away_ppda, home_block, away_block, tactic_label,
      home_xg, away_xg, home_xga, away_xga,
    } = body;

    if (!session_id || !home_abbr || !away_abbr) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sql`
      INSERT INTO match_simulations
        (session_id, home_abbr, away_abbr, home_name, away_name,
         home_goals, away_goals, home_win_pct, draw_pct, away_win_pct,
         home_ppda, away_ppda, home_block, away_block, tactic_label,
         home_xg, away_xg, home_xga, away_xga)
      VALUES
        (${session_id}, ${home_abbr}, ${away_abbr}, ${home_name}, ${away_name},
         ${home_goals}, ${away_goals}, ${home_win_pct}, ${draw_pct}, ${away_win_pct},
         ${home_ppda}, ${away_ppda}, ${home_block}, ${away_block}, ${tactic_label},
         ${home_xg}, ${away_xg}, ${home_xga}, ${away_xga})
    `;

    return Response.json({ ok: true });
  } catch (err) {
    console.error('save-match error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const config = {
  path: '/api/matches',
  method: ['POST', 'OPTIONS'],
};
