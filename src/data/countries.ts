export type Country = {
  name: string;
  code: string;
  group: string;
};

export const COUNTRIES: Country[] = [
  // Grupo A
  { name: "México", code: "MX", group: "A" },
  { name: "Sudáfrica", code: "ZA", group: "A" },
  { name: "Corea del Sur", code: "KR", group: "A" },
  { name: "República Checa", code: "CZ", group: "A" },
  // Grupo B
  { name: "Canadá", code: "CA", group: "B" },
  { name: "Bosnia y Herzegovina", code: "BA", group: "B" },
  { name: "Catar", code: "QA", group: "B" },
  { name: "Suiza", code: "CH", group: "B" },
  // Grupo C
  { name: "Brasil", code: "BR", group: "C" },
  { name: "Marruecos", code: "MA", group: "C" },
  { name: "Haití", code: "HT", group: "C" },
  { name: "Escocia", code: "GB-SCT", group: "C" },
  // Grupo D
  { name: "Estados Unidos", code: "US", group: "D" },
  { name: "Paraguay", code: "PY", group: "D" },
  { name: "Australia", code: "AU", group: "D" },
  { name: "Turquía", code: "TR", group: "D" },
  // Grupo E
  { name: "Alemania", code: "DE", group: "E" },
  { name: "Curazao", code: "CW", group: "E" },
  { name: "Costa de Marfil", code: "CI", group: "E" },
  { name: "Ecuador", code: "EC", group: "E" },
  // Grupo F
  { name: "Países Bajos", code: "NL", group: "F" },
  { name: "Japón", code: "JP", group: "F" },
  { name: "Suecia", code: "SE", group: "F" },
  { name: "Túnez", code: "TN", group: "F" },
  // Grupo G
  { name: "Bélgica", code: "BE", group: "G" },
  { name: "Egipto", code: "EG", group: "G" },
  { name: "Irán", code: "IR", group: "G" },
  { name: "Nueva Zelanda", code: "NZ", group: "G" },
  // Grupo H
  { name: "España", code: "ES", group: "H" },
  { name: "Cabo Verde", code: "CV", group: "H" },
  { name: "Arabia Saudita", code: "SA", group: "H" },
  { name: "Uruguay", code: "UY", group: "H" },
  // Grupo I
  { name: "Francia", code: "FR", group: "I" },
  { name: "Senegal", code: "SN", group: "I" },
  { name: "Irak", code: "IQ", group: "I" },
  { name: "Noruega", code: "NO", group: "I" },
  // Grupo J
  { name: "Argentina", code: "AR", group: "J" },
  { name: "Argelia", code: "DZ", group: "J" },
  { name: "Austria", code: "AT", group: "J" },
  { name: "Jordania", code: "JO", group: "J" },
  // Grupo K
  { name: "Portugal", code: "PT", group: "K" },
  { name: "Rep. Dem. del Congo", code: "CD", group: "K" },
  { name: "Uzbekistán", code: "UZ", group: "K" },
  { name: "Colombia", code: "CO", group: "K" },
  // Grupo L
  { name: "Inglaterra", code: "GB-ENG", group: "L" },
  { name: "Croacia", code: "HR", group: "L" },
  { name: "Ghana", code: "GH", group: "L" },
  { name: "Panamá", code: "PA", group: "L" },
];

export function getCountryName(code?: string | null): string {
  if (!code) return "";
  const country = COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return country ? country.name : code;
}
