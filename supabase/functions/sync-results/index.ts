import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async () => {
  const res = await fetch(
    'https://api.football-data.org/v4/competitions/2000/matches',
    { headers: { 'X-Auth-Token': Deno.env.get('FOOTBALL_API_KEY')! } }
  )
  const { matches } = await res.json()

  let updated = 0
  for (const match of matches) {
    if (match.status !== 'FINISHED') continue

    const { error } = await supabase
      .from('fixtures')
      .update({
        result_home: match.score.fullTime.home,
        result_away: match.score.fullTime.away,
        status: 'FINISHED'
      })
      .eq('external_id', match.id)

    if (!error) updated++
  }

  return new Response(JSON.stringify({ updated }), {
    headers: { 'Content-Type': 'application/json' }
  })
})