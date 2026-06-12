import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const FOOTBALL_DATA_KEY = Deno.env.get('FOOTBALL_DATA_API_KEY')!
const COMPETITION = 'WC'

// football-data.org stage → internal stage code
const STAGE_MAP: Record<string, string> = {
  GROUP_STAGE:      'GROUP',
  LAST_32:          'R32',
  ROUND_OF_32:      'R32',
  LAST_16:          'R16',
  ROUND_OF_16:      'R16',
  QUARTER_FINALS:   'QF',
  SEMI_FINALS:      'SF',
  THIRD_PLACE:      '3RD',
  FINAL:            'F',
}

// football-data.org status → internal status
// EXTRA_TIME / PENALTY_SHOOTOUT → IN_PLAY; AWARDED → FINISHED
const STATUS_MAP: Record<string, string> = {
  SCHEDULED:          'SCHEDULED',
  TIMED:              'TIMED',
  IN_PLAY:            'IN_PLAY',
  PAUSED:             'PAUSED',
  EXTRA_TIME:         'IN_PLAY',
  PENALTY_SHOOTOUT:   'IN_PLAY',
  FINISHED:           'FINISHED',
  POSTPONED:          'POSTPONED',
  SUSPENDED:          'SUSPENDED',
  CANCELLED:          'CANCELLED',
  AWARDED:            'FINISHED',
}

const FLAG_CODES: Record<string, string> = {
  Mexico: 'MX', 'South Africa': 'ZA', 'Korea Republic': 'KR', 'South Korea': 'KR',
  Czechia: 'CZ', 'Czech Republic': 'CZ', Canada: 'CA',
  'Bosnia and Herzegovina': 'BA', 'Bosnia & Herzegovina': 'BA',
  Qatar: 'QA', Switzerland: 'CH', Brazil: 'BR', Morocco: 'MA',
  Haiti: 'HT', Scotland: 'GB-SCT', 'United States': 'US', USA: 'US',
  Paraguay: 'PY', Australia: 'AU', Turkey: 'TR', Türkiye: 'TR',
  Germany: 'DE', Curaçao: 'CW', 'Ivory Coast': 'CI', "Côte d'Ivoire": 'CI',
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
  'El Salvador': 'SV', 'Trinidad and Tobago': 'TT', 'Trinidad & Tobago': 'TT',
  Cameroon: 'CM', Greece: 'GR', Ireland: 'IE', 'Republic of Ireland': 'IE',
  Kenya: 'KE', Nigeria: 'NG', Angola: 'AO', Tanzania: 'TZ', Uganda: 'UG',
  Zambia: 'ZM', Zimbabwe: 'ZW', Mali: 'ML', Guinea: 'GN',
  'DR Congo': 'CD', Congo: 'CG',
}

const TEAM_NAMES_ES: Record<string, string> = {
  Mexico: 'México', 'South Africa': 'Sudáfrica', 'Korea Republic': 'Corea del Sur',
  'South Korea': 'Corea del Sur', Czechia: 'Chequia', 'Czech Republic': 'Chequia',
  Canada: 'Canadá', 'Bosnia and Herzegovina': 'Bosnia y Herzegovina',
  'Bosnia & Herzegovina': 'Bosnia y Herzegovina', Qatar: 'Catar',
  Switzerland: 'Suiza', Brazil: 'Brasil', Morocco: 'Marruecos', Haiti: 'Haití',
  Scotland: 'Escocia', 'United States': 'Estados Unidos', USA: 'Estados Unidos',
  Paraguay: 'Paraguay', Australia: 'Australia', Turkey: 'Turquía', Türkiye: 'Turquía',
  Germany: 'Alemania', Curaçao: 'Curazao', 'Ivory Coast': 'Costa de Marfil',
  "Côte d'Ivoire": 'Costa de Marfil', Ecuador: 'Ecuador',
  Netherlands: 'Países Bajos', Japan: 'Japón', Sweden: 'Suecia',
  Tunisia: 'Túnez', Belgium: 'Bélgica', Egypt: 'Egipto', Iran: 'Irán',
  'New Zealand': 'Nueva Zelanda', Spain: 'España', 'Cape Verde': 'Cabo Verde',
  'Saudi Arabia': 'Arabia Saudita', Uruguay: 'Uruguay', France: 'Francia',
  Senegal: 'Senegal', Iraq: 'Irak', Norway: 'Noruega', Argentina: 'Argentina',
  Algeria: 'Argelia', Austria: 'Austria', Jordan: 'Jordania', Portugal: 'Portugal',
  'DR Congo': 'RD del Congo', Uzbekistan: 'Uzbekistán', Colombia: 'Colombia',
  England: 'Inglaterra', Croatia: 'Croacia', Ghana: 'Ghana', Panama: 'Panamá',
  Wales: 'Gales', 'Northern Ireland': 'Irlanda del Norte', China: 'China',
  'China PR': 'China', 'Costa Rica': 'Costa Rica', Serbia: 'Serbia',
  Denmark: 'Dinamarca', Poland: 'Polonia', Ukraine: 'Ucrania',
  Romania: 'Rumanía', Peru: 'Perú', Chile: 'Chile', Bolivia: 'Bolivia',
  Venezuela: 'Venezuela', Jamaica: 'Jamaica', Honduras: 'Honduras',
  'El Salvador': 'El Salvador', 'Trinidad and Tobago': 'Trinidad y Tobago',
  'Trinidad & Tobago': 'Trinidad y Tobago', Cameroon: 'Camerún',
  Greece: 'Grecia', Ireland: 'Irlanda', 'Republic of Ireland': 'Irlanda',
}

function calcPoints(ph: number, pa: number, rh: number, ra: number): number {
  if (ph === rh && pa === ra) return 10
  if (Math.sign(ph - pa) === Math.sign(rh - ra)) return 5
  return 0
}

Deno.serve(async () => {
  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${COMPETITION}/matches`,
      { headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY } },
    )

    if (res.status === 429) {
      return new Response(
        JSON.stringify({ ok: false, error: 'rate_limited' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      )
    }
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`football-data.org error ${res.status}: ${body}`)
    }

    const json = await res.json()
    const matches: any[] = json.matches ?? []

    // Pre-fetch all existing fixtures to avoid N+1 DB calls
    const { data: existingFixtures, error: fetchErr } = await supabase
      .from('fixtures')
      .select('id, external_id, team_home, team_away, status, result_home, result_away')
    if (fetchErr) throw fetchErr

    const byExternalId = new Map<number, any>()
    const byTeams = new Map<string, any>()
    for (const f of (existingFixtures ?? [])) {
      if (f.external_id != null) byExternalId.set(Number(f.external_id), f)
      byTeams.set(`${f.team_home}|${f.team_away}`, f)
    }

    let inserted = 0
    let updated = 0
    let pointsUpdated = 0
    let errors = 0

    for (const match of matches) {
      try {
        const stage = STAGE_MAP[match.stage] ?? 'GROUP'
        const group: string | null = match.group
          ? String(match.group).replace('GROUP_', '')
          : null
        const teamHomeEN: string = match.homeTeam?.name ?? ''
        const teamAwayEN: string = match.awayTeam?.name ?? ''
        const teamHomeES = TEAM_NAMES_ES[teamHomeEN] ?? teamHomeEN
        const teamAwayES = TEAM_NAMES_ES[teamAwayEN] ?? teamAwayEN
        const flagHome = FLAG_CODES[teamHomeEN] ?? null
        const flagAway = FLAG_CODES[teamAwayEN] ?? null
        const date: string = match.utcDate
        const resultHome: number | null = match.score?.fullTime?.home ?? null
        const resultAway: number | null = match.score?.fullTime?.away ?? null
        const status = STATUS_MAP[match.status] ?? match.status
        const externalId: number = match.id

        // Lookup: prefer exact external_id match, fall back to Spanish team names
        let existing = byExternalId.get(externalId)
        if (!existing) {
          existing = byTeams.get(`${teamHomeES}|${teamAwayES}`)
        }

        const fixturePayload = {
          result_home: resultHome,
          result_away: resultAway,
          status,
          team_home: teamHomeES,
          team_away: teamAwayES,
          flag_home: flagHome,
          flag_away: flagAway,
        }

        let fixtureId: string

        if (existing) {
          // Migrate external_id if needed (first sync after switching APIs)
          const needsIdUpdate = existing.external_id !== externalId
          await supabase
            .from('fixtures')
            .update({ ...fixturePayload, ...(needsIdUpdate ? { external_id: externalId } : {}) })
            .eq('id', existing.id)
          fixtureId = existing.id
          updated++
        } else {
          const { data: newFixture, error: insertErr } = await supabase
            .from('fixtures')
            .insert({
              external_id: externalId,
              stage,
              group_name: group,
              date,
              ...fixturePayload,
            })
            .select('id')
            .single()
          if (insertErr) throw insertErr
          fixtureId = newFixture.id
          inserted++
        }

        // When a match is FINISHED and results changed, recalculate prediction points
        const resultsChanged =
          !existing ||
          existing.status !== 'FINISHED' ||
          existing.result_home !== resultHome ||
          existing.result_away !== resultAway

        if (status === 'FINISHED' && resultHome !== null && resultAway !== null && resultsChanged) {
          const { data: preds } = await supabase
            .from('predictions')
            .select('id, pred_home, pred_away')
            .eq('fixture_id', fixtureId)

          if (preds && preds.length > 0) {
            for (const pred of preds) {
              const pts = calcPoints(pred.pred_home, pred.pred_away, resultHome, resultAway)
              await supabase
                .from('predictions')
                .update({ points: pts })
                .eq('id', pred.id)
              pointsUpdated++
            }
          }
        }
      } catch (matchErr) {
        console.error('Error procesando partido:', match?.id, matchErr)
        errors++
      }
    }

    return new Response(
      JSON.stringify({ ok: true, total: matches.length, inserted, updated, pointsUpdated, errors }),
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
