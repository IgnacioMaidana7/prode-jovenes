import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const API_URL = 'https://worldcup26.ir/get/games'

// UTC offsets por stadium_id (horario de verano / DST del torneo)
// México abolió el DST en 2023, siempre UTC-6
// US/Canadá en verano: Eastern=UTC-4, Central=UTC-5, Pacific=UTC-7
const STADIUM_UTC_OFFSETS: Record<number, number> = {
  1:  -6, // Mexico City (Estadio Azteca)
  2:  -6, // Guadalajara (Estadio Akron)
  3:  -6, // Monterrey (Estadio BBVA)
  4:  -5, // Dallas (AT&T Stadium)
  5:  -5, // Houston (NRG Stadium)
  6:  -5, // Kansas City (Arrowhead)
  7:  -4, // Atlanta (Mercedes-Benz)
  8:  -4, // Miami (Hard Rock)
  9:  -4, // Boston (Gillette)
  10: -4, // Philadelphia (Lincoln Financial)
  11: -4, // New York/NJ (MetLife)
  12: -4, // Toronto (BMO Field)
  13: -7, // Vancouver (BC Place)
  14: -7, // Seattle (Lumen Field)
  15: -7, // San Francisco (Levi's)
  16: -7, // Los Angeles (SoFi)
}

// API type → internal stage
const STAGE_MAP: Record<string, string> = {
  group: 'GROUP',
  r32:   'R32',
  r16:   'R16',
  qf:    'QF',
  sf:    'SF',
  final: 'F',
  third: '3RD',
}

const FLAG_CODES: Record<string, string> = {
  Mexico: 'MX', 'South Africa': 'ZA', 'South Korea': 'KR',
  'Czech Republic': 'CZ', Canada: 'CA', 'Bosnia and Herzegovina': 'BA',
  Qatar: 'QA', Switzerland: 'CH', Brazil: 'BR', Morocco: 'MA',
  Haiti: 'HT', Scotland: 'GB-SCT', 'United States': 'US', USA: 'US',
  Paraguay: 'PY', Australia: 'AU', Turkey: 'TR', Türkiye: 'TR',
  Germany: 'DE', Curaçao: 'CW', "Côte d'Ivoire": 'CI', 'Ivory Coast': 'CI',
  Ecuador: 'EC', Netherlands: 'NL', Japan: 'JP', Sweden: 'SE',
  Tunisia: 'TN', Belgium: 'BE', Egypt: 'EG', Iran: 'IR',
  'New Zealand': 'NZ', Spain: 'ES', 'Cape Verde': 'CV', 'Saudi Arabia': 'SA',
  Uruguay: 'UY', France: 'FR', Senegal: 'SN', Iraq: 'IQ', Norway: 'NO',
  Argentina: 'AR', Algeria: 'DZ', Austria: 'AT', Jordan: 'JO',
  Portugal: 'PT', 'DR Congo': 'CD', Uzbekistan: 'UZ', Colombia: 'CO',
  England: 'GB-ENG', Croatia: 'HR', Ghana: 'GH', Panama: 'PA',
  Wales: 'GB-WLS', 'Northern Ireland': 'GB-NIR', China: 'CN', 'China PR': 'CN',
  'Costa Rica': 'CR', Serbia: 'RS', Denmark: 'DK', Poland: 'PL',
  Ukraine: 'UA', Romania: 'RO', Peru: 'PE', Chile: 'CL',
  Bolivia: 'BO', Venezuela: 'VE', Jamaica: 'JM', Honduras: 'HN',
  'El Salvador': 'SV', 'Trinidad and Tobago': 'TT', Cameroon: 'CM',
  Greece: 'GR', Ireland: 'IE', Nigeria: 'NG', Kenya: 'KE',
}

const TEAM_NAMES_ES: Record<string, string> = {
  Mexico: 'México', 'South Africa': 'Sudáfrica', 'South Korea': 'Corea del Sur',
  'Czech Republic': 'Chequia', Canada: 'Canadá',
  'Bosnia and Herzegovina': 'Bosnia y Herzegovina',
  Qatar: 'Catar', Switzerland: 'Suiza', Brazil: 'Brasil', Morocco: 'Marruecos',
  Haiti: 'Haití', Scotland: 'Escocia', 'United States': 'Estados Unidos',
  USA: 'Estados Unidos', Paraguay: 'Paraguay', Australia: 'Australia',
  Turkey: 'Turquía', Türkiye: 'Turquía', Germany: 'Alemania',
  Curaçao: 'Curazao', "Côte d'Ivoire": 'Costa de Marfil',
  'Ivory Coast': 'Costa de Marfil', Ecuador: 'Ecuador',
  Netherlands: 'Países Bajos', Japan: 'Japón', Sweden: 'Suecia',
  Tunisia: 'Túnez', Belgium: 'Bélgica', Egypt: 'Egipto', Iran: 'Irán',
  'New Zealand': 'Nueva Zelanda', Spain: 'España', 'Cape Verde': 'Cabo Verde',
  'Saudi Arabia': 'Arabia Saudita', Uruguay: 'Uruguay', France: 'Francia',
  Senegal: 'Senegal', Iraq: 'Irak', Norway: 'Noruega', Argentina: 'Argentina',
  Algeria: 'Argelia', Austria: 'Austria', Jordan: 'Jordania',
  Portugal: 'Portugal', 'DR Congo': 'RD del Congo', Uzbekistan: 'Uzbekistán',
  Colombia: 'Colombia', England: 'Inglaterra', Croatia: 'Croacia',
  Ghana: 'Ghana', Panama: 'Panamá', Wales: 'Gales',
  'Northern Ireland': 'Irlanda del Norte', China: 'China', 'China PR': 'China',
  'Costa Rica': 'Costa Rica', Serbia: 'Serbia', Denmark: 'Dinamarca',
  Poland: 'Polonia', Ukraine: 'Ucrania', Romania: 'Rumanía', Peru: 'Perú',
  Chile: 'Chile', Bolivia: 'Bolivia', Venezuela: 'Venezuela', Jamaica: 'Jamaica',
  Honduras: 'Honduras', 'El Salvador': 'El Salvador',
  'Trinidad and Tobago': 'Trinidad y Tobago', Cameroon: 'Camerún',
  Greece: 'Grecia', Ireland: 'Irlanda', Nigeria: 'Nigeria', Kenya: 'Kenia',
}

// "MM/DD/YYYY HH:MM" (hora local del estadio) → ISO UTC string
function parseDate(localDate: string, stadiumId: number | string): string {
  const offset = STADIUM_UTC_OFFSETS[Number(stadiumId)] ?? -5
  const [datePart, timePart] = localDate.split(' ')
  const [month, day, year] = datePart.split('/')
  const sign = offset < 0 ? '-' : '+'
  const absOffset = Math.abs(offset)
  const offsetStr = `${sign}${String(absOffset).padStart(2, '0')}:00`
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00${offsetStr}`
}

function deriveStatus(game: any): string {
  if (game.finished === 'TRUE') return 'FINISHED'
  try {
    const gameDate = new Date(parseDate(game.local_date, game.stadium_id))
    if (gameDate <= new Date()) return 'IN_PLAY'
  } catch { /* ignore parse errors */ }
  return 'SCHEDULED'
}

function calcPoints(ph: number, pa: number, rh: number, ra: number): number {
  if (ph === rh && pa === ra) return 10
  if (Math.sign(ph - pa) === Math.sign(rh - ra)) return 5
  return 0
}

Deno.serve(async () => {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const json = await res.json()
    const games: any[] = json.games ?? []

    // Pre-fetch all fixtures once to avoid N+1 queries
    const { data: existingFixtures, error: fetchErr } = await supabase
      .from('fixtures')
      .select('id, external_id, team_home, team_away, status, result_home, result_away')
    if (fetchErr) throw fetchErr

    const byExternalId = new Map<number, any>()
    const byTeams = new Map<string, any>()
    for (const f of existingFixtures ?? []) {
      if (f.external_id != null) byExternalId.set(Number(f.external_id), f)
      byTeams.set(`${f.team_home}|${f.team_away}`, f)
    }

    let inserted = 0, updated = 0, pointsUpdated = 0, errors = 0

    for (const game of games) {
      try {
        const externalId = Number(game.id)
        const stage = STAGE_MAP[game.type] ?? 'GROUP'
        // group field is the letter for group stage, "R32" etc for knockout
        const groupName: string | null =
          game.type === 'group' ? (game.group ?? null) : null

        // Team names: knockout TBD games use label fields
        const teamHomeEN: string =
          game.home_team_name_en || game.home_team_label || 'TBD'
        const teamAwayEN: string =
          game.away_team_name_en || game.away_team_label || 'TBD'
        const teamHomeES = TEAM_NAMES_ES[teamHomeEN] ?? teamHomeEN
        const teamAwayES = TEAM_NAMES_ES[teamAwayEN] ?? teamAwayEN
        const flagHome = FLAG_CODES[teamHomeEN] ?? null
        const flagAway = FLAG_CODES[teamAwayEN] ?? null

        const status = deriveStatus(game)
        const isFinished = status === 'FINISHED'
        const resultHome = isFinished ? parseInt(game.home_score, 10) : null
        const resultAway = isFinished ? parseInt(game.away_score, 10) : null

        // Find existing fixture
        let existing = byExternalId.get(externalId)
        if (!existing && teamHomeES !== 'TBD') {
          existing = byTeams.get(`${teamHomeES}|${teamAwayES}`)
        }

        const isoDate = parseDate(game.local_date, game.stadium_id)

        const payload = {
          result_home: resultHome,
          result_away: resultAway,
          status,
          team_home: teamHomeES,
          team_away: teamAwayES,
          flag_home: flagHome,
          flag_away: flagAway,
          date: isoDate, // siempre actualizar con la timezone correcta del estadio
        }

        let fixtureId: string

        if (existing) {
          const needsIdUpdate = existing.external_id !== externalId
          await supabase
            .from('fixtures')
            .update({ ...payload, ...(needsIdUpdate ? { external_id: externalId } : {}) })
            .eq('id', existing.id)
          fixtureId = existing.id
          updated++
        } else {
          const { data: newF, error: insertErr } = await supabase
            .from('fixtures')
            .insert({
              external_id: externalId,
              stage,
              group_name: groupName,
              date: isoDate,
              ...payload,
            })
            .select('id')
            .single()
          if (insertErr) throw insertErr
          fixtureId = newF.id
          inserted++
        }

        // Recalculate prediction points when a match transitions to FINISHED
        const resultsChanged =
          !existing ||
          existing.status !== 'FINISHED' ||
          existing.result_home !== resultHome ||
          existing.result_away !== resultAway

        if (isFinished && resultHome !== null && resultAway !== null && resultsChanged) {
          const { data: preds } = await supabase
            .from('predictions')
            .select('id, pred_home, pred_away')
            .eq('fixture_id', fixtureId)

          for (const pred of preds ?? []) {
            const pts = calcPoints(pred.pred_home, pred.pred_away, resultHome, resultAway)
            await supabase.from('predictions').update({ points: pts }).eq('id', pred.id)
            pointsUpdated++
          }
        }
      } catch (gameErr) {
        console.error('Error procesando partido', game?.id, gameErr)
        errors++
      }
    }

    return new Response(
      JSON.stringify({ ok: true, total: games.length, inserted, updated, pointsUpdated, errors }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('Error general:', err)
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
