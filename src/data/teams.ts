export type Team = {
  code: string;
  name: string;
  group: "A" | "B" | "C" | "D";
};

export const teams: Team[] = [
  { code: "AR", name: "Argentina", group: "A" },
  { code: "CA", name: "Canadá", group: "A" },
  { code: "PE", name: "Perú", group: "A" },
  { code: "CL", name: "Chile", group: "A" },

  { code: "US", name: "Estados Unidos", group: "B" },
  { code: "MX", name: "México", group: "B" },
  { code: "UY", name: "Uruguay", group: "B" },
  { code: "PA", name: "Panamá", group: "B" },

  { code: "BR", name: "Brasil", group: "C" },
  { code: "CO", name: "Colombia", group: "C" },
  { code: "EC", name: "Ecuador", group: "C" },
  { code: "VE", name: "Venezuela", group: "C" },

  { code: "ES", name: "España", group: "D" },
  { code: "FR", name: "Francia", group: "D" },
  { code: "NL", name: "Holanda", group: "D" },
  { code: "MA", name: "Marruecos", group: "D" },
];

export const teamsByCode = Object.fromEntries(
  teams.map((t) => [t.code, t])
) as Record<string, Team>;

export function getTeam(code: string): Team | undefined {
  return teamsByCode[code];
}
