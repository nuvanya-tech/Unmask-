import { QuestionItem, Stage, RoomVibe, ChaosModifier, ForfeitItem } from '../types/game';

export const FORFEIT_PENALTIES: ForfeitItem[] = [
  { id: 'f_drink', title: 'Liquid Courage', icon: '🥃', description: 'Take a double sip or penalty shot of your current beverage right now.', severity: 'mild' },
  { id: 'f_voice', title: 'Unhinged Voice Note', icon: '🎙️', description: 'Record a 10-second dramatic whisper saying the phrase chosen by your partner.', severity: 'spicy' },
  { id: 'f_text', title: 'Contact Roulette', icon: '📱', description: 'Let your partner pick one word: you must text it to the 3rd person in your recent chats.', severity: 'unhinged' },
  { id: 'f_photo', title: 'Cursed Selfie', icon: '📸', description: 'Take an instant unflattering selfie making your weirdest double-chin face and send photo proof.', severity: 'spicy' },
  { id: 'f_stare', title: 'Frozen Stare', icon: '👁️', description: 'Maintain deadpan eye contact for 40 seconds without blinking or cracking a smile.', severity: 'mild' },
  { id: 'f_roast', title: 'Savage Self-Roast', icon: '🔥', description: 'Deliver a brutal, 20-second standup roast about your own worst dating or personality habit.', severity: 'spicy' },
  { id: 'f_master', title: 'Master Command', icon: '👑', description: 'Your partner gets 1 unquestioned command they can cash in at any point during this game.', severity: 'unhinged' },
  { id: 'f_search', title: 'History Reveal', icon: '🔍', description: 'Read aloud the last 3 items in your YouTube or browser search history with zero context.', severity: 'spicy' },
];

export const STAGE_CONFIG: Record<Stage, { name: string; range: string; minRound: number; maxRound: number; description: string; accentColor: string }> = {
  life: {
    name: 'Life',
    range: 'Rounds 1–5',
    minRound: 1,
    maxRound: 5,
    description: 'Casual, nostalgic, and joyful conversation to get comfortable.',
    accentColor: '#59D8AD',
  },
  personal: {
    name: 'Personal',
    range: 'Rounds 6–10',
    minRound: 6,
    maxRound: 10,
    description: 'Habits, pride, misunderstandings, and authentic quirks.',
    accentColor: '#927CFF',
  },
  deep: {
    name: 'Deep',
    range: 'Rounds 11–15',
    minRound: 11,
    maxRound: 15,
    description: 'Unspoken fears, pivotal changes, and what shapes your core.',
    accentColor: '#6E53ED',
  },
  dark: {
    name: 'Dark',
    range: 'Rounds 16–20',
    minRound: 16,
    maxRound: 20,
    description: 'Unresolved regrets, difficult choices, and uncomfortable truths.',
    accentColor: '#F05D9F',
  },
  abyss: {
    name: 'Abyss',
    range: 'Rounds 21–25',
    minRound: 21,
    maxRound: 25,
    description: 'Maximum emotional honesty. Unfiltered vulnerabilities without armor.',
    accentColor: '#FF7B84',
  },
};

export function getStageForRound(round: number): Stage {
  if (round <= 5) return 'life';
  if (round <= 10) return 'personal';
  if (round <= 15) return 'deep';
  if (round <= 20) return 'dark';
  return 'abyss';
}

export const QUESTION_DECK: QuestionItem[] = [
  // --- LIFE (Rounds 1-5) ---
  { id: 'l_t1', text: 'What was your favourite thing to do as a kid that you miss now?', type: 'TRUTH', stage: 'life', vibe: 'REAL' },
  { id: 'l_t2', text: 'What is something small that makes you happy for no apparent reason?', type: 'TRUTH', stage: 'life', vibe: 'REAL' },
  { id: 'l_t3', text: 'What place in the world currently feels most like home to you?', type: 'TRUTH', stage: 'life', vibe: 'REAL' },
  { id: 'l_t4', text: 'What would your ideal, uninterrupted 24-hour day look like?', type: 'TRUTH', stage: 'life', vibe: 'REAL' },
  { id: 'l_t5', text: 'What topic could you give an impromptu 40-minute presentation on?', type: 'TRUTH', stage: 'life', vibe: 'REAL' },
  { id: 'l_t6', text: 'What ridiculous food combination do you secretly enjoy?', type: 'TRUTH', stage: 'life', vibe: 'FUNNY' },
  { id: 'l_t7', text: 'What is the most useless piece of trivia that permanently lives in your brain?', type: 'TRUTH', stage: 'life', vibe: 'FUNNY' },
  { id: 'l_t8', text: 'What was your most memorable spontaneous decision that turned out great?', type: 'TRUTH', stage: 'life', vibe: 'REAL' },
  { id: 'l_t9', text: 'Which fictional world would you happily move into tomorrow if you had the choice?', type: 'TRUTH', stage: 'life', vibe: 'FUNNY' },
  { id: 'l_t10', text: 'What song immediately resets your mood when you are having an off day?', type: 'TRUTH', stage: 'life', vibe: 'REAL' },

  // Dares - Life
  { id: 'l_d1', text: 'Give the other player an unexpectedly sincere compliment about something subtle.', type: 'DARE', stage: 'life', vibe: 'REAL' },
  { id: 'l_d2', text: 'Describe yourself right now as if you were a dramatic voiceover in a noir film trailer.', type: 'DARE', stage: 'life', vibe: 'FUNNY' },
  { id: 'l_d3', text: 'Pick three random everyday items near you and invent a high-stakes adventure story connecting them.', type: 'DARE', stage: 'life', vibe: 'FUNNY' },
  { id: 'l_d4', text: 'Deliver a passionate 20-second speech convincing the other person of your weirdest harmless opinion.', type: 'DARE', stage: 'life', vibe: 'REAL' },
  { id: 'l_d5', text: 'Show the most recent photo in your camera roll (or describe it vividly if not on camera).', type: 'DARE', stage: 'life', vibe: 'FUNNY', isPhotoMandate: true },

  // --- PERSONAL (Rounds 6-10) ---
  { id: 'p_t1', text: 'What do people usually get wrong about you upon first meeting?', type: 'TRUTH', stage: 'personal', vibe: 'REAL' },
  { id: 'p_t2', text: 'What is something you are quietly proud of, but never bring up in polite conversation?', type: 'TRUTH', stage: 'personal', vibe: 'REAL' },
  { id: 'p_t3', text: 'What small everyday habit would you immediately trade away if you could?', type: 'TRUTH', stage: 'personal', vibe: 'REAL' },
  { id: 'p_t4', text: 'In what environment or company do you feel most authentically yourself?', type: 'TRUTH', stage: 'personal', vibe: 'REAL' },
  { id: 'p_t5', text: 'Who in your life understands your thought process better than anyone else?', type: 'TRUTH', stage: 'personal', vibe: 'REAL' },
  { id: 'p_t6', text: 'What compliment felt uncomfortable to receive because you did not believe it?', type: 'TRUTH', stage: 'personal', vibe: 'DEEP' },
  { id: 'p_t7', text: 'What is something you pretend to dislike just because everyone else hypes it up?', type: 'TRUTH', stage: 'personal', vibe: 'FUNNY' },
  { id: 'p_t8', text: 'When was the last time you changed your mind on something you used to be stubborn about?', type: 'TRUTH', stage: 'personal', vibe: 'REAL' },
  { id: 'p_t9', text: 'What is a personal boundary you took too long in your life to finally set?', type: 'TRUTH', stage: 'personal', vibe: 'DEEP' },
  { id: 'p_t10', text: 'What is your immediate defense mechanism when you feel vulnerable or judged?', type: 'TRUTH', stage: 'personal', vibe: 'REAL' },

  // Dares - Personal
  { id: 'p_d1', text: 'Admit an embarrassing phase you went through that you tried desperately to convince yourself was cool.', type: 'DARE', stage: 'personal', vibe: 'FUNNY' },
  { id: 'p_d2', text: 'Look at the other player (or address them directly) and tell them your genuine first impression of them.', type: 'DARE', stage: 'personal', vibe: 'REAL' },
  { id: 'p_d3', text: 'Read aloud the last search term you typed in your private browser or notes app.', type: 'DARE', stage: 'personal', vibe: 'FUNNY' },
  { id: 'p_d4', text: 'Speak about one of your current insecurities in third-person for 30 seconds as an objective observer.', type: 'DARE', stage: 'personal', vibe: 'DEEP' },

  // --- WILDEST & HIGH VOLTAGE (WILDEST / SPICY DECKS) ---
  { id: 'w_t1', text: 'Who in your contact list is the most dangerous person you could drunk-text at 2 AM?', type: 'TRUTH', stage: 'personal', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t2', text: 'What is a secret turn-on or taboo obsession you have that would shock your friends?', type: 'TRUTH', stage: 'deep', vibe: 'WILDEST', intensity: 'UNHINGED' },
  { id: 'w_t3', text: 'Have you ever secretly had romantic or physical thoughts about someone in this room or a friend’s partner?', type: 'TRUTH', stage: 'dark', vibe: 'WILDEST', intensity: 'UNHINGED' },
  { id: 'w_t4', text: 'What was the most morally questionable thing you did that you got away with completely scot-free?', type: 'TRUTH', stage: 'dark', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t5', text: 'What is the pettiest, most toxic revenge you ever secretly enacted on someone who crossed you?', type: 'TRUTH', stage: 'dark', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t6', text: 'If someone handed your partner your unlocked phone with 5 minutes of immunity, what folder would you panic about most?', type: 'TRUTH', stage: 'personal', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t7', text: 'What is the absolute wildest thing on your private bucket list that you’ve never told a soul?', type: 'TRUTH', stage: 'abyss', vibe: 'WILDEST', intensity: 'UNHINGED' },
  { id: 'w_t8', text: 'Have you ever lied about your feelings or whispered "I love you" without actually meaning it?', type: 'TRUTH', stage: 'abyss', vibe: 'WILDEST', intensity: 'UNHINGED' },
  { id: 'w_t9', text: 'Rate our chemistry or tension right now from 1 to 10, and tell me exactly what would make it a 10.', type: 'TRUTH', stage: 'personal', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t10', text: 'What is something intimate or sensual you secretly crave trying, but have been too proud to ask for?', type: 'TRUTH', stage: 'deep', vibe: 'WILDEST', intensity: 'UNHINGED' },
  { id: 'w_t11', text: 'What was your most disastrous, chaotic, or embarrassing romantic encounter?', type: 'TRUTH', stage: 'personal', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t12', text: 'Have you ever stalked an ex’s new romantic interest? How deep down the rabbit hole did you go?', type: 'TRUTH', stage: 'personal', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t13', text: 'What is the biggest red flag about your own dating or relationship style that you try to conceal?', type: 'TRUTH', stage: 'dark', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t14', text: 'If we were locked in a bedroom for 24 hours with zero phones and zero rules, what happens first?', type: 'TRUTH', stage: 'deep', vibe: 'WILDEST', intensity: 'UNHINGED' },
  { id: 'w_t15', text: 'What was a lie you told someone that spiraled so out of control you had to maintain it for months?', type: 'TRUTH', stage: 'dark', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t16', text: 'Who is the one person you regret kissing or sleeping with the most in your life?', type: 'TRUTH', stage: 'abyss', vibe: 'WILDEST', intensity: 'UNHINGED' },
  { id: 'w_t17', text: 'What toxic trait do you find dangerously, uncontrollably attractive in other people?', type: 'TRUTH', stage: 'personal', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t18', text: 'What is a secret opinion you have about my personality that you’ve been holding back from telling me?', type: 'TRUTH', stage: 'deep', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t19', text: 'Have you ever sent a risky photo or message to the completely wrong person? What happened?', type: 'TRUTH', stage: 'personal', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_t20', text: 'What is the closest you ever came to getting caught doing something completely forbidden?', type: 'TRUTH', stage: 'dark', vibe: 'WILDEST', intensity: 'UNHINGED' },

  // Wild Dares
  { id: 'w_d1', text: 'Voice Note Confession: Record a 15-second voice note whisper admitting your biggest guilty pleasure right now.', type: 'DARE', stage: 'personal', vibe: 'WILDEST', intensity: 'WILD', isVoiceMandate: true },
  { id: 'w_d2', text: 'Photo Proof: Snap an immediate uncensored selfie showing your real reaction to this exact moment.', type: 'DARE', stage: 'deep', vibe: 'WILDEST', intensity: 'WILD', isPhotoMandate: true },
  { id: 'w_d3', text: 'Blindfold/Eyes Closed: Close your eyes and let the other player ask 3 rapid-fire yes/no questions you must answer in 1 second.', type: 'DARE', stage: 'dark', vibe: 'WILDEST', intensity: 'UNHINGED' },
  { id: 'w_d4', text: 'The Stare Down: Maintain unbroken eye contact for 40 seconds. First to laugh or blink takes a double penalty.', type: 'DARE', stage: 'life', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_d5', text: 'Camera Roll Roulette: Open your photos, scroll with eyes closed for 4 seconds, and describe or show the exact photo your thumb lands on.', type: 'DARE', stage: 'personal', vibe: 'WILDEST', intensity: 'WILD', isPhotoMandate: true },
  { id: 'w_d6', text: 'Dramatic Whisper: Lean in close (or to your mic) and whisper what you genuinely thought of me the first day we met.', type: 'DARE', stage: 'personal', vibe: 'WILDEST', intensity: 'WILD', isVoiceMandate: true },
  { id: 'w_d7', text: 'Savage Roast: Deliver a brutal 25-second standup roast about your partner’s biggest quirk or habit.', type: 'DARE', stage: 'life', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_d8', text: 'Contact Roulette: Let your partner pick a random letter: you must read aloud the first contact that appears under that letter in your phone.', type: 'DARE', stage: 'dark', vibe: 'WILDEST', intensity: 'UNHINGED' },
  { id: 'w_d9', text: 'Search History Reveal: Read aloud the last 3 items you searched in YouTube, TikTok, or your web browser.', type: 'DARE', stage: 'personal', vibe: 'WILDEST', intensity: 'WILD' },
  { id: 'w_d10', text: 'Master Command: Your partner is granted 1 free command they can enforce at any moment before the end of this game.', type: 'DARE', stage: 'abyss', vibe: 'WILDEST', intensity: 'UNHINGED' },

  // --- DEEP (Rounds 11-15) ---
  { id: 'd_t1', text: 'What is a quiet fear you carry that you almost never show to the people around you?', type: 'TRUTH', stage: 'deep', vibe: 'DEEP' },
  { id: 'd_t2', text: 'What single experience has transformed your character more than anything else?', type: 'TRUTH', stage: 'deep', vibe: 'DEEP' },
  { id: 'd_t3', text: 'What do you wish someone close to you would finally understand without you having to explain it?', type: 'TRUTH', stage: 'deep', vibe: 'DEEP' },
  { id: 'd_t4', text: 'When in your life do you feel the most isolated, even in a room full of friendly people?', type: 'TRUTH', stage: 'deep', vibe: 'DEEP' },
  { id: 'd_t5', text: 'What part of who you are today do you feel you are still actively figuring out?', type: 'TRUTH', stage: 'deep', vibe: 'DEEP' },
  { id: 'd_t6', text: 'What old version of yourself do you sometimes miss, and what version are you glad is gone?', type: 'TRUTH', stage: 'deep', vibe: 'REAL' },
  { id: 'd_t7', text: 'Has anyone ever seen you cry in a way that truly terrified you to be seen?', type: 'TRUTH', stage: 'deep', vibe: 'DEEP' },
  { id: 'd_t8', text: 'What relationship or friendship ended that you never got true closure on?', type: 'TRUTH', stage: 'deep', vibe: 'DEEP' },
  { id: 'd_t9', text: 'What expectation placed on you by family or society feels heaviest to carry?', type: 'TRUTH', stage: 'deep', vibe: 'DEEP' },
  { id: 'd_t10', text: 'If you had to apologize to yourself for one thing over the past five years, what would it be?', type: 'TRUTH', stage: 'deep', vibe: 'DEEP' },

  // Dares - Deep
  { id: 'd_d1', text: 'Share a secret hope for your life that you have never spoken aloud because it sounds too ambitious or delicate.', type: 'DARE', stage: 'deep', vibe: 'DEEP' },
  { id: 'd_d2', text: 'Tell the other player one specific thing you admire about how they handle themselves.', type: 'DARE', stage: 'deep', vibe: 'REAL' },
  { id: 'd_d3', text: 'Recall a moment when you felt genuinely weak, and describe who was there for you (or who wasn’t).', type: 'DARE', stage: 'deep', vibe: 'DEEP' },

  // --- DARK (Rounds 16-20) ---
  { id: 'dk_t1', text: 'What is a regret you carry that you almost never bring up because speaking it hurts?', type: 'TRUTH', stage: 'dark', vibe: 'DARK' },
  { id: 'dk_t2', text: 'What truth about your own flaws or shortcomings is the most painful for you to accept?', type: 'TRUTH', stage: 'dark', vibe: 'DARK' },
  { id: 'dk_t3', text: 'Have you ever deliberately hurt someone emotionally, and did you ever give them the apology they deserved?', type: 'TRUTH', stage: 'dark', vibe: 'DARK' },
  { id: 'dk_t4', text: 'What would genuinely shock people in your regular social circle if they knew it about your past?', type: 'TRUTH', stage: 'dark', vibe: 'DARK' },
  { id: 'dk_t5', text: 'What past crossroads or choice do you still occasionally replay in your head at 2:00 AM?', type: 'TRUTH', stage: 'dark', vibe: 'DARK' },
  { id: 'dk_t6', text: 'What is a grudge or resentment you are holding onto even though you know it poisons only you?', type: 'TRUTH', stage: 'dark', vibe: 'DARK' },
  { id: 'dk_t7', text: 'When was the last time you lied right to someone’s face to protect your own image?', type: 'TRUTH', stage: 'dark', vibe: 'DARK' },
  { id: 'dk_t8', text: 'What is something selfish you did that you have never openly admitted to anyone?', type: 'TRUTH', stage: 'dark', vibe: 'DARK' },
  { id: 'dk_t9', text: 'Have you ever envied a friend so deeply that you secretly wished they would fail?', type: 'TRUTH', stage: 'dark', vibe: 'DARK' },
  { id: 'dk_t10', text: 'What part of your morality do you compromise most frequently when convenience calls?', type: 'TRUTH', stage: 'dark', vibe: 'DARK' },

  // Dares - Dark
  { id: 'dk_d1', text: 'Name the person in your life you feel the most unresolved tension with, and state what you never had the courage to say to them.', type: 'DARE', stage: 'dark', vibe: 'DARK' },
  { id: 'dk_d2', text: 'Confess a thought you had today or this week that you immediately felt guilty about.', type: 'DARE', stage: 'dark', vibe: 'DARK' },
  { id: 'dk_d3', text: 'Draft an unsent message or note to someone you owe an honest confession to.', type: 'DARE', stage: 'dark', vibe: 'DARK' },

  // --- ABYSS (Rounds 21-25) ---
  { id: 'ab_t1', text: 'What are you terrified that your life might ultimately turn out to be?', type: 'TRUTH', stage: 'abyss', vibe: 'DARK' },
  { id: 'ab_t2', text: 'What core part of your daily persona feels like an exhausting performance you cannot stop giving?', type: 'TRUTH', stage: 'abyss', vibe: 'DARK' },
  { id: 'ab_t3', text: 'What are you constantly trying to prove in your achievements, and whose ghost are you trying to prove it to?', type: 'TRUTH', stage: 'abyss', vibe: 'DARK' },
  { id: 'ab_t4', text: 'What would you confess right now if you had absolute certainty that no one would ever judge you or leave?', type: 'TRUTH', stage: 'abyss', vibe: 'DARK' },
  { id: 'ab_t5', text: 'What belief you have held about yourself for ten years might be completely delusional?', type: 'TRUTH', stage: 'abyss', vibe: 'DARK' },
  { id: 'ab_t6', text: 'If today was your last opportunity to speak honestly with this person, what raw truth would you leave them with?', type: 'TRUTH', stage: 'abyss', vibe: 'DEEP' },
  { id: 'ab_t7', text: 'What is the most vulnerable question you could possibly be asked right now?', type: 'TRUTH', stage: 'abyss', vibe: 'DARK' },
  { id: 'ab_t8', text: 'What mask do you wear when you look in the mirror alone?', type: 'TRUTH', stage: 'abyss', vibe: 'DARK' },

  // Dares - Abyss
  { id: 'ab_d1', text: 'Drop all self-deprecation, sarcasm, and shields: look the other player in the eyes and tell them one unvarnished truth about how you see your own worth.', type: 'DARE', stage: 'abyss', vibe: 'DARK' },
  { id: 'ab_d2', text: 'Give the other player total permission to ask you any single unfiltered question of their choice, which you promise to answer without deflection.', type: 'DARE', stage: 'abyss', vibe: 'DARK' },
];

export const CHAOS_MODIFIERS: { id: ChaosModifier; title: string; description: string; badge: string; isWild?: boolean }[] = [
  { id: 'BLIND_DUO', title: 'Blind Duo Showdown', description: 'Both players answer the same question simultaneously in secret, then reveal together!', badge: '⚡ BLIND DUO', isWild: true },
  { id: 'VOICE_MANDATE', title: 'Voice Note Truth', description: 'Answerer must speak their truth via microphone voice recording.', badge: '🎙️ VOICE ONLY', isWild: true },
  { id: 'FORFEIT_ROULETTE', title: 'Forfeit Roulette', description: 'If the answerer hesitates or skips, they face the Punishment Wheel.', badge: '💀 FORFEIT', isWild: true },
  { id: 'SPEED_RUN', title: 'Hot Seat Bomb (20s)', description: 'Ticking countdown: deliver response before time expires.', badge: '💣 20s BOMB', isWild: true },
  { id: 'DOUBLE_XP', title: 'Double XP Surge', description: 'Next rating awards 2x XP points.', badge: '2X XP' },
  { id: 'CUSTOM_ONLY', title: 'Original Sin', description: 'Questioner must author a raw, original question.', badge: 'WRITER' },
  { id: 'REVERSE', title: 'Mirror Turn', description: 'Roles swap immediately: Questioner is forced into the hot seat.', badge: 'SWAP', isWild: true },
  { id: 'ONE_WORD', title: 'One Word', description: 'Answerer must respond with exactly one powerful word.', badge: 'MINIMAL' },
];

export const AVATAR_OPTIONS = [
  { id: 'phantom', name: 'Phantom', gradient: 'from-[#927CFF] to-[#6E53ED]', border: '#927CFF', icon: 'mask' },
  { id: 'ember', name: 'Ember', gradient: 'from-[#F05D9F] to-[#FF7B84]', border: '#F05D9F', icon: 'flame' },
  { id: 'velvet', name: 'Velvet', gradient: 'from-[#6E53ED] to-[#3B82F6]', border: '#6E53ED', icon: 'eye' },
  { id: 'aurora', name: 'Aurora', gradient: 'from-[#59D8AD] to-[#38BDF8]', border: '#59D8AD', icon: 'sparkle' },
  { id: 'obsidian', name: 'Obsidian', gradient: 'from-[#475569] to-[#1E293B]', border: '#94A3B8', icon: 'moon' },
  { id: 'solaris', name: 'Solaris', gradient: 'from-[#EFC65D] to-[#F97316]', border: '#EFC65D', icon: 'sun' },
];

export const ACHIEVEMENTS_LIST = [
  { id: 'first_step', title: 'First Step', description: 'Complete your first question & answer round.', icon: '🌱' },
  { id: 'open_book', title: 'Open Book', description: 'Answer 10 questions truthfully.', icon: '📖' },
  { id: 'wild_rebel', title: 'Wild Rebel', description: 'Survive 5 Wildest/Unhinged rounds without skipping.', icon: '🔥' },
  { id: 'voice_confessor', title: 'Voice Confessor', description: 'Record 3 voice note truths.', icon: '🎙️' },
  { id: 'forfeit_survivor', title: 'Roulette Survivor', description: 'Complete 2 forfeit penalties like a champion.', icon: '🥃' },
  { id: 'blind_sync', title: 'Blind Sync', description: 'Conquer a Blind Duo simultaneous confession.', icon: '⚡' },
  { id: 'into_the_dark', title: 'Into the Dark', description: 'Advance past round 15 into Dark territory.', icon: '🌑' },
  { id: 'abyss_walker', title: 'Abyss Walker', description: 'Reach and conquer round 25.', icon: '🌌' },
  { id: 'no_filter', title: 'No Filter', description: 'Receive a perfect 5.0 connection score.', icon: '💎' },
  { id: 'moment_curator', title: 'Memory Keeper', description: 'Save 3 memorable moments to your memory box.', icon: '🗝️' },
];
