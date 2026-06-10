import type { Team } from "./teams";
import { teams } from "./teams";

export type GroupId = "A" | "B" | "C" | "D";

export type Group = {
  id: GroupId;
  label: string;
  teams: Team[];
};

export const groups: Group[] = (["A", "B", "C", "D"] as const).map((id) => ({
  id,
  label: `Grupo ${id}`,
  teams: teams.filter((t) => t.group === id),
}));

export const groupsById = Object.fromEntries(
  groups.map((g) => [g.id, g])
) as Record<GroupId, Group>;
