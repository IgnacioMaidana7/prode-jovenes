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
  'Wales': 'GB-WLS', 'Northern Ireland': 'GB-NIR', 'China': 'CN',
  'Costa Rica': 'CR', 'Serbia': 'RS', 'Denmark': 'DK', 'Poland': 'PL',
  'Ukraine': 'UA', 'Romania': 'RO', 'Peru': 'PE', 'Chile': 'CL',
  'Bolivia': 'BO', 'Venezuela': 'VE', 'Jamaica': 'JM', 'Honduras': 'HN',
  'El Salvador': 'SV', 'Trinidad and Tobago': 'TT', 'Cameroon': 'CM',
  'Greece': 'GR', 'Ireland': 'IE', 'Côte d\'Ivoire': 'CI',
}

const TEAM_NAMES_ES: Record<string, string> = {
  'Mexico': 'México', 'South Africa': 'Sudáfrica', 'South Korea': 'Corea del Sur',
  'Czech Republic': 'Chequia', 'Canada': 'Canadá', 'Bosnia & Herzegovina': 'Bosnia y Herzegovina',
  'Qatar': 'Catar', 'Switzerland': 'Suiza', 'Brazil': 'Brasil', 'Morocco': 'Marruecos',
  'Haiti': 'Haití', 'Scotland': 'Escocia', 'USA': 'Estados Unidos', 'Paraguay': 'Paraguay',
  'Australia': 'Australia', 'Turkey': 'Turquía', 'Germany': 'Alemania', 'Curaçao': 'Curazao',
  'Ivory Coast': 'Costa de Marfil', 'Ecuador': 'Ecuador', 'Netherlands': 'Países Bajos',
  'Japan': 'Japón', 'Sweden': 'Suecia', 'Tunisia': 'Túnez', 'Belgium': 'Bélgica',
  'Egypt': 'Egipto', 'Iran': 'Irán', 'New Zealand': 'Nueva Zelanda', 'Spain': 'España',
  'Cape Verde': 'Cabo Verde', 'Saudi Arabia': 'Arabia Saudita', 'Uruguay': 'Uruguay',
  'France': 'Francia', 'Senegal': 'Senegal', 'Iraq': 'Irak', 'Norway': 'Noruega',
  'Argentina': 'Argentina', 'Algeria': 'Argelia', 'Austria': 'Austria', 'Jordan': 'Jordania',
  'Portugal': 'Portugal', 'DR Congo': 'RD del Congo', 'Uzbekistan': 'Uzbekistán',
  'Colombia': 'Colombia', 'England': 'Inglaterra', 'Croatia': 'Croacia', 'Ghana': 'Ghana',
  'Panama': 'Panamá', 'Wales': 'Gales', 'Northern Ireland': 'Irlanda del Norte',
  'China': 'China', 'Costa Rica': 'Costa Rica', 'Serbia': 'Serbia',
  'Denmark': 'Dinamarca', 'Poland': 'Polonia', 'Ukraine': 'Ucrania',
  'Romania': 'Rumanía', 'Peru': 'Perú', 'Chile': 'Chile',
  'Bolivia': 'Bolivia', 'Venezuela': 'Venezuela', 'Jamaica': 'Jamaica',
  'Honduras': 'Honduras', 'El Salvador': 'El Salvador',
  'Trinidad and Tobago': 'Trinidad y Tobago', 'Cameroon': 'Camerún',
  'Greece': 'Grecia', 'Ireland': 'Irlanda', 'Côte d\'Ivoire': 'Costa de Marfil',
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
          team_home: TEAM_NAMES_ES[match.team1] ?? match.team1 ?? null,
          team_away: TEAM_NAMES_ES[match.team2] ?? match.team2 ?? null,
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