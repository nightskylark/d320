import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { generateReadableShowId, normalizeShowIdInput } from "../utils/showId";
import type {
  CharacterCard,
  PollDoc,
  PollStats,
  ScreenMode,
  ShowDoc,
  ShowStatus,
  StartPollPayload,
  VoteDoc,
} from "../types";

export const DEFAULT_SHOW_ID = "main-show";

const SHOWS_COLLECTION = "rpg-shows";
const POLLS_COLLECTION = "polls";
const VOTES_COLLECTION = "votes";

const DEFAULT_CHARACTERS: CharacterCard[] = [
  { id: "char-1", name: "Персонаж 1" },
  { id: "char-2", name: "Персонаж 2" },
  { id: "char-3", name: "Персонаж 3" },
  { id: "char-4", name: "Персонаж 4" },
];

const isString = (value: unknown): value is string => typeof value === "string";

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const showRef = (showId: string) => doc(collection(db, SHOWS_COLLECTION), showId);
const showsCollectionRef = () => collection(db, SHOWS_COLLECTION);
const pollsCollectionRef = (showId: string) => collection(showRef(showId), POLLS_COLLECTION);
const pollRef = (showId: string, pollId: string) => doc(pollsCollectionRef(showId), pollId);
const votesCollectionRef = (showId: string, pollId: string) => collection(pollRef(showId, pollId), VOTES_COLLECTION);
const voteRef = (showId: string, pollId: string, voterKey: string) => doc(votesCollectionRef(showId, pollId), voterKey);

const mapShowStatus = (value: unknown): ShowStatus => {
  if (value === "POLL_ACTIVE" || value === "POLL_RESULT" || value === "IDLE") {
    return value;
  }
  return "IDLE";
};

const mapScreenMode = (value: unknown): ScreenMode => {
  if (value === "POLL" || value === "RESULT" || value === "IDLE") {
    return value;
  }
  return "IDLE";
};

const normalizeCharacters = (value: unknown): CharacterCard[] => {
  if (!Array.isArray(value)) {
    return DEFAULT_CHARACTERS;
  }

  const normalized = value
    .map((item, index) => {
      const data = (item as Partial<CharacterCard>) ?? {};
      const legacyAvatar = (data as { avatar?: unknown }).avatar;
      const imageUrl = isString(data.imageUrl) ? data.imageUrl : isString(legacyAvatar) ? legacyAvatar : "";
      return {
        id: isString(data.id) && data.id.trim() ? data.id : `char-${index + 1}`,
        name: isString(data.name) && data.name.trim() ? data.name.trim() : `Персонаж ${index + 1}`,
        imageUrl,
        subtitle: isString(data.subtitle) ? data.subtitle : "",
      } satisfies CharacterCard;
    })
    .slice(0, 8);

  return normalized.length > 0 ? normalized : DEFAULT_CHARACTERS;
};

const normalizePollOptions = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return ["", "", ""];
  }

  const options = value.map((item) => (isString(item) ? item : "")).slice(0, 12);
  return options.length > 0 ? options : ["", "", ""];
};

const mapShow = (id: string, raw: unknown): ShowDoc => {
  const data = (raw as Partial<ShowDoc>) ?? {};
  const createdAt = isNumber(data.createdAt) ? data.createdAt : Date.now();
  const updatedAt = isNumber(data.updatedAt) ? data.updatedAt : createdAt;

  return {
    id,
    name: isString(data.name) && data.name.trim() ? data.name : "RPG Show",
    status: mapShowStatus(data.status),
    screenMode: mapScreenMode(data.screenMode),
    activePollId: isString(data.activePollId) && data.activePollId ? data.activePollId : null,
    allowVoteChange: Boolean(data.allowVoteChange),
    characters: normalizeCharacters(data.characters),
    createdAt,
    updatedAt,
    masterUid: isString(data.masterUid) ? data.masterUid : null,
  };
};

const mapPoll = (id: string, raw: unknown, showId: string): PollDoc => {
  const data = (raw as Partial<PollDoc>) ?? {};
  const startedAt = isNumber(data.startedAt) ? data.startedAt : Date.now();
  const durationSec = isNumber(data.durationSec) ? data.durationSec : 30;

  return {
    id,
    showId,
    question: isString(data.question) ? data.question : "",
    options: normalizePollOptions(data.options),
    status: data.status === "FINISHED" ? "FINISHED" : "ACTIVE",
    durationSec,
    startedAt,
    endsAt: isNumber(data.endsAt) ? data.endsAt : startedAt + durationSec * 1000,
    endedAt: isNumber(data.endedAt) ? data.endedAt : null,
  };
};

const mapVote = (raw: unknown): VoteDoc | null => {
  const data = (raw as Partial<VoteDoc>) ?? {};
  if (!isString(data.voterKey) || !isNumber(data.optionIndex)) {
    return null;
  }

  return {
    voterKey: data.voterKey,
    optionIndex: data.optionIndex,
    createdAt: isNumber(data.createdAt) ? data.createdAt : Date.now(),
    updatedAt: isNumber(data.updatedAt) ? data.updatedAt : Date.now(),
  };
};

const buildStats = (votes: VoteDoc[], optionCount: number): PollStats => {
  const safeCount = Math.max(1, optionCount);
  const optionVotes = Array.from({ length: safeCount }, () => 0);

  for (const vote of votes) {
    if (vote.optionIndex >= 0 && vote.optionIndex < safeCount) {
      optionVotes[vote.optionIndex] += 1;
    }
  }

  const totalVotes = optionVotes.reduce((sum, value) => sum + value, 0);
  const optionPercents = optionVotes.map((count) => (totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100)));

  return {
    totalVotes,
    optionVotes,
    optionPercents,
  };
};

const createDefaultShow = (showId: string, name: string, masterUid: string): ShowDoc => {
  const now = Date.now();
  return {
    id: showId,
    name,
    status: "IDLE",
    screenMode: "IDLE",
    activePollId: null,
    allowVoteChange: true,
    characters: DEFAULT_CHARACTERS,
    createdAt: now,
    updatedAt: now,
    masterUid,
  };
};

const toValidOptions = (options: string[]): string[] => {
  const normalized = options.map((item) => item.trim()).slice(0, 12);
  return normalized.length > 0 ? normalized : ["", "", ""];
};

const mapModeToStatus = (mode: ScreenMode): ShowStatus => {
  if (mode === "POLL") {
    return "POLL_ACTIVE";
  }

  if (mode === "RESULT") {
    return "POLL_RESULT";
  }

  return "IDLE";
};

export const ensureShow = async (
  showId: string,
  name = "RPG Show",
  masterUid?: string | null
): Promise<ShowDoc> => {
  const ref = showRef(showId);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    return mapShow(snapshot.id, snapshot.data());
  }

  if (!masterUid) {
    throw new Error("SHOW_NOT_FOUND");
  }

  const show = createDefaultShow(showId, name, masterUid);
  await setDoc(ref, show, { merge: true });
  return show;
};

export const createShow = async (masterUid: string, name: string): Promise<ShowDoc> => {
  const showName = name.trim() || `Новое шоу ${new Date().toLocaleDateString()}`;
  let resolvedId = "";

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const candidate = normalizeShowIdInput(generateReadableShowId());
    if (!candidate) {
      continue;
    }

    const candidateSnapshot = await getDoc(showRef(candidate));
    if (!candidateSnapshot.exists()) {
      resolvedId = candidate;
      break;
    }
  }

  if (!resolvedId) {
    resolvedId = doc(showsCollectionRef()).id;
  }

  const show = createDefaultShow(resolvedId, showName, masterUid);
  await setDoc(showRef(resolvedId), show);
  return show;
};

export const subscribeOwnedShows = (ownerUid: string, onChange: (shows: ShowDoc[]) => void): (() => void) => {
  const ownerQuery = query(showsCollectionRef(), where("masterUid", "==", ownerUid));

  return onSnapshot(ownerQuery, (snapshot) => {
    const shows = snapshot.docs
      .map((item) => mapShow(item.id, item.data()))
      .sort((a, b) => b.createdAt - a.createdAt);

    onChange(shows);
  });
};

export const subscribeShow = (showId: string, onChange: (show: ShowDoc | null) => void): (() => void) => {
  return onSnapshot(showRef(showId), (snapshot) => {
    if (!snapshot.exists()) {
      onChange(null);
      return;
    }

    onChange(mapShow(snapshot.id, snapshot.data()));
  });
};

export const subscribePoll = (
  showId: string,
  pollId: string,
  onChange: (poll: PollDoc | null) => void
): (() => void) => {
  return onSnapshot(pollRef(showId, pollId), (snapshot) => {
    if (!snapshot.exists()) {
      onChange(null);
      return;
    }

    onChange(mapPoll(snapshot.id, snapshot.data(), showId));
  });
};

export const subscribeRecentPolls = (
  showId: string,
  onChange: (polls: PollDoc[]) => void,
  maxItems = 10
): (() => void) => {
  const pollsQuery = query(pollsCollectionRef(showId), orderBy("startedAt", "desc"), limit(maxItems));

  return onSnapshot(pollsQuery, (snapshot) => {
    const polls = snapshot.docs.map((item) => mapPoll(item.id, item.data(), showId));
    onChange(polls);
  });
};

export const subscribePollVotes = (
  showId: string,
  pollId: string,
  optionCount: number,
  onChange: (stats: PollStats, votes: VoteDoc[]) => void
): (() => void) => {
  return onSnapshot(votesCollectionRef(showId, pollId), (snapshot) => {
    const votes = snapshot.docs
      .map((item) => mapVote(item.data()))
      .filter((vote): vote is VoteDoc => vote !== null);

    onChange(buildStats(votes, optionCount), votes);
  });
};

export const subscribeVoterVote = (
  showId: string,
  pollId: string,
  voterKey: string,
  onChange: (vote: VoteDoc | null) => void
): (() => void) => {
  return onSnapshot(voteRef(showId, pollId, voterKey), (snapshot) => {
    if (!snapshot.exists()) {
      onChange(null);
      return;
    }

    onChange(mapVote(snapshot.data()));
  });
};

export const updateShowName = async (showId: string, name: string): Promise<void> => {
  await updateDoc(showRef(showId), {
    name,
    updatedAt: Date.now(),
  });
};

export const updateShowCharacters = async (showId: string, characters: CharacterCard[]): Promise<void> => {
  await updateDoc(showRef(showId), {
    characters,
    updatedAt: Date.now(),
  });
};

export const setAllowVoteChange = async (showId: string, allowVoteChange: boolean): Promise<void> => {
  await updateDoc(showRef(showId), {
    allowVoteChange,
    updatedAt: Date.now(),
  });
};

export const setScreenMode = async (showId: string, mode: ScreenMode): Promise<void> => {
  await updateDoc(showRef(showId), {
    screenMode: mode,
    status: mapModeToStatus(mode),
    updatedAt: Date.now(),
  });
};

export const startPoll = async (showId: string, payload: StartPollPayload): Promise<string> => {
  const pollId = await runTransaction(db, async (transaction) => {
    const now = Date.now();
    const showSnapshot = await transaction.get(showRef(showId));
    if (!showSnapshot.exists()) {
      throw new Error("SHOW_NOT_FOUND");
    }

    const show = mapShow(showSnapshot.id, showSnapshot.data());

    if (show.activePollId) {
      const previousPollReference = pollRef(showId, show.activePollId);
      const previousPollSnapshot = await transaction.get(previousPollReference);

      if (previousPollSnapshot.exists()) {
        const previousPoll = mapPoll(previousPollSnapshot.id, previousPollSnapshot.data(), showId);
        if (previousPoll.status === "ACTIVE") {
          transaction.update(previousPollReference, {
            status: "FINISHED",
            endedAt: now,
          });
        }
      }
    }

    const options = toValidOptions(payload.options);
    const newPollReference = doc(pollsCollectionRef(showId));
    const poll: PollDoc = {
      id: newPollReference.id,
      showId,
      question: payload.question,
      options,
      status: "ACTIVE",
      durationSec: payload.durationSec,
      startedAt: now,
      endsAt: now + payload.durationSec * 1000,
      endedAt: null,
    };

    transaction.set(newPollReference, poll);
    transaction.update(showRef(showId), {
      activePollId: newPollReference.id,
      status: "POLL_ACTIVE",
      screenMode: "POLL",
      updatedAt: now,
    });

    return newPollReference.id;
  });

  return pollId;
};

export const stopPoll = async (showId: string, pollId?: string): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    const now = Date.now();
    const showSnapshot = await transaction.get(showRef(showId));
    if (!showSnapshot.exists()) {
      throw new Error("SHOW_NOT_FOUND");
    }

    const show = mapShow(showSnapshot.id, showSnapshot.data());
    const targetPollId = pollId ?? show.activePollId;

    if (targetPollId) {
      const targetPollReference = pollRef(showId, targetPollId);
      const targetPollSnapshot = await transaction.get(targetPollReference);
      if (targetPollSnapshot.exists()) {
        const poll = mapPoll(targetPollSnapshot.id, targetPollSnapshot.data(), showId);
        if (poll.status !== "FINISHED") {
          transaction.update(targetPollReference, {
            status: "FINISHED",
            endedAt: now,
          });
        }
      }
    }

    transaction.update(showRef(showId), {
      activePollId: targetPollId ?? null,
      status: "POLL_RESULT",
      screenMode: "RESULT",
      updatedAt: now,
    });
  });
};

export const ensurePollFinished = async (showId: string, pollId: string): Promise<boolean> => {
  return runTransaction(db, async (transaction) => {
    const now = Date.now();
    const pollSnapshot = await transaction.get(pollRef(showId, pollId));
    if (!pollSnapshot.exists()) {
      return false;
    }

    const poll = mapPoll(pollSnapshot.id, pollSnapshot.data(), showId);
    if (poll.status !== "ACTIVE" || now < poll.endsAt) {
      return false;
    }

    transaction.update(pollRef(showId, pollId), {
      status: "FINISHED",
      endedAt: now,
    });

    transaction.update(showRef(showId), {
      activePollId: pollId,
      status: "POLL_RESULT",
      screenMode: "RESULT",
      updatedAt: now,
    });

    return true;
  });
};

export const submitVote = async (
  showId: string,
  pollId: string,
  voterKey: string,
  optionIndex: number
): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    const now = Date.now();

    const showSnapshot = await transaction.get(showRef(showId));
    if (!showSnapshot.exists()) {
      throw new Error("SHOW_NOT_FOUND");
    }

    const show = mapShow(showSnapshot.id, showSnapshot.data());
    const pollSnapshot = await transaction.get(pollRef(showId, pollId));
    if (!pollSnapshot.exists()) {
      throw new Error("POLL_NOT_FOUND");
    }

    const poll = mapPoll(pollSnapshot.id, pollSnapshot.data(), showId);
    if (poll.status !== "ACTIVE" || now >= poll.endsAt) {
      throw new Error("POLL_FINISHED");
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      throw new Error("INVALID_OPTION");
    }

    const currentVoteReference = voteRef(showId, pollId, voterKey);
    const currentVoteSnapshot = await transaction.get(currentVoteReference);

    const existingVote = currentVoteSnapshot.exists() ? mapVote(currentVoteSnapshot.data()) : null;
    if (existingVote && !show.allowVoteChange && existingVote.optionIndex !== optionIndex) {
      throw new Error("VOTE_CHANGE_NOT_ALLOWED");
    }

    transaction.set(currentVoteReference, {
      voterKey,
      optionIndex,
      createdAt: existingVote?.createdAt ?? now,
      updatedAt: now,
    });
  });
};
