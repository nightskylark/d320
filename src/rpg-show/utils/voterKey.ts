const KEY_PREFIX = "d320-rpg-show-voter:";

const generateUuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const getOrCreateVoterKey = (showId: string): string => {
  const storageKey = `${KEY_PREFIX}${showId}`;
  const existing = window.localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }

  const voterKey = generateUuid();
  window.localStorage.setItem(storageKey, voterKey);
  return voterKey;
};
