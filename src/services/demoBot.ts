import { QuestionItem, RatingData, Stage } from '../types/game';
import { QUESTION_DECK } from '../data/questions';

export interface DemoAnswerOption {
  text: string;
  isDareCompleted?: boolean;
}

const DEMO_ANSWERS_BY_STAGE: Record<Stage, string[]> = {
  life: [
    'Building treehouses in the backyard with my cousins until dinner was called. Time felt completely limitless back then.',
    'The smell of fresh rain on hot asphalt and when a favorite song comes on when you start the car.',
    'A quiet coastal town in autumn, wrapped in a heavy wool sweater with no alarm set for the morning.',
    'Coffee in silence, four uninterrupted hours of reading, a long walk with no phone, and cooking a slow meal with wine.',
    'The complete history and architectural evolution of medieval stone castles and bridges.',
  ],
  personal: [
    'People assume I am completely unbothered and detached, but I actually replay small interactions for hours in private.',
    'I quietly helped my younger sister through her hardest college semester without ever telling our parents.',
    'Checking my phone within three seconds of waking up before even opening the curtains.',
    'Late at night, when the rest of the apartment is asleep and there is nobody I have to perform being “put-together” for.',
    'My childhood friend Maya. She can spot my subtle micro-expressions before I even realize I’m anxious.',
  ],
  deep: [
    'That everyone I love will eventually realize I have just been improvising everything and don’t actually have it together.',
    'Losing my grandfather when I was nineteen. It shattered my illusion that time was an abundant resource.',
    'That when I withdraw into silence, it’s not because I’m upset with them—it’s because my emotional battery is down to zero.',
    'In a crowded room at social celebrations where everyone seems genuinely carefree and I feel like an observer behind glass.',
    'How to accept affection without immediately wondering what expectations come attached to it.',
  ],
  dark: [
    'Letting a six-year friendship slowly wither away during a move because I was too proud to be the one who reached out first.',
    'Accepting that I can be deeply envious when people close to me achieve things I secretly wanted for myself.',
    'Yes. In early university, I iced out a roommate over something petty and never gave them the genuine closure they deserved.',
    'How close I came to quitting everything and walking away without leaving a note during my lowest winter three years ago.',
    'Whether I should have taken that overseas scholarship instead of staying for a relationship that ended eight months later.',
  ],
  abyss: [
    'That I might spend my entire life curating an image of fulfillment while quietly feeling spiritually hollow underneath.',
    'The whole composed, reliable professional persona. Most days I feel like a tired teenager wearing adult armor.',
    'My father’s approval, even now. Every goalpost I move is an attempt to hear him say he’s finally proud without caveats.',
    'That I am terrified of genuine intimacy because once someone sees the unedited parts of me, they might walk away.',
    'That my independence is strength. In truth, it’s often just deep avoidance disguised as self-reliance.',
  ],
};

const DEMO_DARE_RESPONSES = [
  'Done! I just recorded a quick 20-second honest voice note / typed a raw uncensored compliment into my notes.',
  'Done! I paused, dropped the polite guard, and gave an uncomfortably sincere appreciation.',
  'Done! Completed the challenge with zero deflection.',
];

export function getDemoAnswer(question: QuestionItem): { answer: string; isTooPersonal: boolean } {
  // 5% chance of skipping if stage is dark or abyss, to demonstrate safe skip
  if ((question.stage === 'dark' || question.stage === 'abyss') && Math.random() < 0.08) {
    return {
      answer: 'This question touches a raw nerve I am not ready to unpack tonight. Choosing to pass safely.',
      isTooPersonal: true,
    };
  }

  if (question.type === 'DARE') {
    const dareRes = DEMO_DARE_RESPONSES[Math.floor(Math.random() * DEMO_DARE_RESPONSES.length)];
    return { answer: dareRes, isTooPersonal: false };
  }

  const stageAnswers = DEMO_ANSWERS_BY_STAGE[question.stage] || DEMO_ANSWERS_BY_STAGE.life;
  const picked = stageAnswers[Math.floor(Math.random() * stageAnswers.length)];
  return { answer: picked, isTooPersonal: false };
}

export function getDemoQuestion(stage: Stage, preferTruth = true): QuestionItem {
  const matching = QUESTION_DECK.filter((q) => q.stage === stage && (preferTruth ? q.type === 'TRUTH' : true));
  if (matching.length > 0) {
    return matching[Math.floor(Math.random() * matching.length)];
  }
  return QUESTION_DECK[0];
}

export function getDemoRating(answerText: string, isTooPersonal: boolean): RatingData {
  if (isTooPersonal) {
    return {
      honesty: 5,
      depth: 4,
      impact: 4,
      score: 4.33,
      reaction: '🫂',
      points: 25,
    };
  }

  // Generous, thoughtful ratings
  const lengthBonus = answerText.length > 80 ? 1 : 0;
  const honesty = Math.min(5, Math.floor(Math.random() * 2) + 4); // 4 or 5
  const depth = Math.min(5, Math.floor(Math.random() * 2) + 3 + lengthBonus); // 4 or 5
  const impact = Math.min(5, Math.floor(Math.random() * 2) + 4); // 4 or 5

  const score = Number(((honesty + depth + impact) / 3).toFixed(2));
  const reactions = ['❤️', '🤯', '👀', '🫂', '😮'];
  const reaction = reactions[Math.floor(Math.random() * reactions.length)];

  return {
    honesty,
    depth,
    impact,
    score,
    reaction,
    points: Math.round(score * 10) + 15,
  };
}
