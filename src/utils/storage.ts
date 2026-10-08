import { UserProfile, SavedMoment, PersonRecord } from '../types/game';

const PROFILE_KEY = 'unmask_profile';
const MOMENTS_KEY = 'unmask_moments';
const PEOPLE_KEY = 'unmask_people';
const STREAK_DATE_KEY = 'unmask_streak_date';

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  return {
    name: 'Seeker',
    avatar: 'phantom',
    title: 'Newcomer',
    totalXp: 120,
    streak: 1,
    gamesCompleted: 0,
    questionsAsked: 0,
    questionsAnswered: 0,
    daresDone: 0,
    customQuestionsCount: 0,
    highestRound: 1,
    unlockedAchievements: ['first_step'],
  };
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    // Compute dynamic title based on total XP & depth
    if (profile.highestRound >= 21) {
      profile.title = 'Unmasked';
    } else if (profile.highestRound >= 16) {
      profile.title = 'Abyss Diver';
    } else if (profile.totalXp >= 1000) {
      profile.title = 'Truth Seeker';
    } else if (profile.totalXp >= 400) {
      profile.title = 'Regular';
    } else {
      profile.title = 'Newcomer';
    }

    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function getStoredMoments(): SavedMoment[] {
  try {
    const raw = localStorage.getItem(MOMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function addStoredMoment(moment: SavedMoment): SavedMoment[] {
  const moments = getStoredMoments();
  // Check duplicate
  const exists = moments.some((m) => m.question === moment.question && m.answer === moment.answer);
  if (!exists) {
    const updated = [moment, ...moments];
    try {
      localStorage.setItem(MOMENTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }
  return moments;
}

export function removeStoredMoment(id: string): SavedMoment[] {
  const moments = getStoredMoments().filter((m) => m.id !== id);
  try {
    localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
  } catch {
    // ignore
  }
  return moments;
}

export function getStoredPeople(): PersonRecord[] {
  try {
    const raw = localStorage.getItem(PEOPLE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function recordPlayedPerson(name: string, avatar: string, score: number): void {
  const people = getStoredPeople();
  const existingIndex = people.findIndex((p) => p.name.toLowerCase() === name.toLowerCase());

  if (existingIndex >= 0) {
    const existing = people[existingIndex];
    const newGamesCount = existing.gamesTogether + 1;
    const newAverage = Number(((existing.averageScore * existing.gamesTogether + score) / newGamesCount).toFixed(1));
    people[existingIndex] = {
      ...existing,
      avatar,
      gamesTogether: newGamesCount,
      averageScore: newAverage,
      lastPlayed: 'Just now',
    };
  } else {
    people.unshift({
      id: 'p_' + Date.now(),
      name,
      avatar,
      gamesTogether: 1,
      averageScore: Number(score.toFixed(1)),
      lastPlayed: 'Today',
    });
  }

  try {
    localStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
  } catch {
    // ignore
  }
}

export function checkAndIncrementStreak(): number {
  try {
    const profile = getStoredProfile();
    const lastDate = localStorage.getItem(STREAK_DATE_KEY);
    const today = new Date().toISOString().slice(0, 10);

    if (!lastDate) {
      localStorage.setItem(STREAK_DATE_KEY, today);
      return profile.streak;
    }

    if (lastDate === today) {
      return profile.streak;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === yesterday) {
      profile.streak += 1;
    } else {
      profile.streak = 1;
    }

    localStorage.setItem(STREAK_DATE_KEY, today);
    saveStoredProfile(profile);
    return profile.streak;
  } catch {
    return 1;
  }
}
