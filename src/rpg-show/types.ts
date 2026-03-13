export type ScreenMode = "IDLE" | "POLL" | "RESULT";

export type ShowStatus = "IDLE" | "POLL_ACTIVE" | "POLL_RESULT";

export type PollStatus = "ACTIVE" | "FINISHED";

export interface CharacterCard {
  id: string;
  name: string;
  imageUrl?: string;
  subtitle?: string;
  accent?: string;
}

export interface ShowDoc {
  id: string;
  name: string;
  status: ShowStatus;
  screenMode: ScreenMode;
  activePollId: string | null;
  allowVoteChange: boolean;
  characters: CharacterCard[];
  createdAt: number;
  updatedAt: number;
  masterUid: string | null;
}

export interface PollDoc {
  id: string;
  showId: string;
  question: string;
  options: string[];
  status: PollStatus;
  durationSec: number;
  startedAt: number;
  endsAt: number;
  endedAt: number | null;
}

export interface VoteDoc {
  voterKey: string;
  optionIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface PollStats {
  totalVotes: number;
  optionVotes: number[];
  optionPercents: number[];
}

export interface StartPollPayload {
  question: string;
  options: string[];
  durationSec: number;
}
