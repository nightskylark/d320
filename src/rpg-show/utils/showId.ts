const ADJECTIVES = [
  "amber",
  "brave",
  "cobalt",
  "crimson",
  "frost",
  "gold",
  "lucky",
  "nova",
  "rapid",
  "silent",
  "solar",
  "swift",
] as const;

const NOUNS = [
  "fox",
  "hawk",
  "otter",
  "raven",
  "tiger",
  "wolf",
  "lynx",
  "falcon",
  "dragon",
  "griffin",
  "sphinx",
  "kraken",
] as const;

export const normalizeShowIdInput = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
};

export const generateReadableShowId = (): string => {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suffix = Math.floor(Math.random() * 90 + 10);

  return `${adjective}-${noun}-${suffix}`;
};
