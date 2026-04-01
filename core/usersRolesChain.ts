import crypto from "crypto";

/** Shared UUID for create-a-role → update-a-role → delete-a-role on the same worker (same role name in CMS). */
let chainUnique: string | null = null;
/** Full primary-column label from create flow default: `Doc QA Role ${uuid}` (list cells may truncate — also match uuid substring). */
let chainRolePrimaryLabel: string | null = null;

export function resetUsersRolesChainUnique(): void {
  chainUnique = null;
  chainRolePrimaryLabel = null;
}

export function ensureUsersRolesChainUnique(): string {
  if (!chainUnique) {
    chainUnique = crypto.randomUUID();
    chainRolePrimaryLabel = `Doc QA Role ${chainUnique}`;
  }
  return chainUnique;
}

export function getUsersRolesChainUnique(): string | null {
  return chainUnique;
}

export function getUsersRolesChainRolePrimaryLabel(): string | null {
  return chainRolePrimaryLabel;
}
