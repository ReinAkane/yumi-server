export const combatStatusType = 'combat status';
export type CombatStatus = {
    type: typeof combatStatusType
};

export type Union = CombatStatus;
export type UnionType = typeof combatStatusType;
