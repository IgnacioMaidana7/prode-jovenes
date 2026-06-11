import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const FLAG_CODES: Record<string, string> = {
  'Mexico': 'MX', 'South Africa': 'ZA', 'South Korea': 'KR', 'Czech Republic': 'CZ',
  'Canada': 'CA', 'Bosnia & Herzegovina': 'BA', 'Qatar': 'QA', 'Switzerland': 'CH',
  'Brazil': 'BR', 'Morocco': 'MA', 'Haiti': 'HT', 'Scotland': 'GB-SCT',
  'USA': 'US', 'Paraguay': 'PY', 'Australia': 'AU', 'Turkey': 'TR',
  'Germany': 'DE', 'Curaçao': 'CW', 'Ivory Coast': 'CI', 'Ecuador': 'EC',
  'Netherlands': 'NL', 'Japan': 'JP', 'Sweden': 'SE', 'Tunisia': 'TN',
  'Belgium': 'BE', 'Egypt': 'EG', 'Iran': 'IR', 'New Zealand': 'NZ',
  'Spain': 'ES', 'Cape Verde': 'CV', 'Saudi Arabia': 'SA', 'Uruguay': 'UY',
  'France': 'FR', 'Senegal': 'SN', 'Iraq': 'IQ', 'Norway': 'NO',
  'Argentina': 'AR', 'Algeria': 'DZ', 'Austria': 'AT', 'Jordan': 'JO',
  'Portugal': 'PT', 'DR Congo': 'CD', 'Uzbekistan': 'UZ', 'Colombia': 'CO',
  'England': 'GB-ENG', 'Croatia': 'HR', 'Ghana': 'GH', 'Panama': 'PA',
}

// Convierte "13:00 UTC-6" → offset en minutos (-360)
function parseTimeToUTC(date: string, time: string): string {
  // Extrae "13:00" y "UTC-6"
  const match = time.match(/(\d{2}):(\d{2})\s*UTC([+-]\d+)/)
  if (!match) return new Date(date).toISOString()

  const hours = parseInt(match[1])
  const minutes = parseInt(match[2])
  const offset = parseInt(match[3]) // ej: -6

  // Construye la fecha en UTC
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCHours(hours - offset) // resta el offset para convertir a UTC
  d.setUTCMinutes(minutes)
  return d.toISOString()
}

function getStage(round: string, group?: string): string {
  if (group) return 'GROUP'
  if (round.includes('Round of 32')) return 'R32'
  if (round.includes('Round of 16')) return 'R16'
  if (round.includes('Quarter')) return 'QF'
  if (round.includes('Semi')) return 'SF'
  if (round.includes('Third') || round.includes('3rd')) return '3RD'
  if (round.includes('Final')) return 'F'
  return 'GROUP'
}

Deno.serve(async () => {
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'
    )

    if (!res.ok) {
      throw new Error(`GitHub fetch failed: ${res.status}`)
    }

    const data = await res.json()
    const matches: any[] = data.matches ?? []

    let inserted = 0
    let updated = 0
    let errors = 0

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]

      try {
        const stage = getStage(match.round ?? '', match.group)
        const groupName = match.group ? match.group.replace('Group ', '') : null
        const dateISO = parseTimeToUTC(match.date, match.time ?? '00:00 UTC+0')

        // Detectar resultado
        const score = match.score
        const resultHome = score?.ft?.[0] ?? score?.['ft']?.[0] ?? null
        const resultAway = score?.ft?.[1] ?? score?.['ft']?.[1] ?? null
        const status = (resultHome !== null && resultAway !== null) ? 'FINISHED' : 'SCHEDULED'

        const fixture = {
          external_id: i + 1, // openfootball no tiene ID, usamos el índice
          stage,
          group_name: groupName,
          team_home: match.team1 ?? null,
          team_away: match.team2 ?? null,
          flag_home: FLAG_CODES[match.team1] ?? null,
          flag_away: FLAG_CODES[match.team2] ?? null,
          date: dateISO,
          result_home: resultHome,
          result_away: resultAway,
          status,
        }

        // Verificar si ya existe
        const { data: existing, error: selectError } = await supabase
          .from('fixtures')
          .select('id')
          .eq('external_id', fixture.external_id)
          .maybeSingle()

        if (selectError) throw selectError

        if (existing) {
          const { error } = await supabase
            .from('fixtures')
            .update({
              result_home: fixture.result_home,
              result_away: fixture.result_away,
              status: fixture.status,
              team_home: fixture.team_home,
              team_away: fixture.team_away,
            })
            .eq('external_id', fixture.external_id)
          if (error) throw error
          updated++
        } else {
          const { error } = await supabase
            .from('fixtures')
            .insert(fixture)
          if (error) throw error
          inserted++
        }
      } catch (matchErr) {
        console.error(`Error en partido ${i}:`, matchErr)
        errors++
      }
    }

    return new Response(
      JSON.stringify({ ok: true, inserted, updated, errors, total: matches.length }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Error general:', err)
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})