/**
 * Viral Loop Engine — Makes INÖ market itself.
 *
 * Auto-generates shareable content from client data:
 * transformation reels, social proof cards, workout summaries,
 * public challenges, team competitions.
 */

export interface ShareableCard {
  id: string;
  type: 'transformation' | 'pr' | 'streak' | 'workout_summary' | 'challenge_rank' | 'team_win';
  clientName: string;
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  shareUrl: string;
  imageUrl?: string;
  generatedAt: string;
}

export interface TransformationReel {
  id: string;
  clientName: string;
  photos: { date: string; url: string; view: 'front' | 'side' | 'back' }[];
  metrics: { label: string; before: string; after: string }[];
  duration: string;
  musicTrack?: string;
  generatedAt: string;
}

export interface TeamCompetition {
  id: string;
  name: string;
  teams: {
    name: string;
    members: string[];
    score: number;
    workouts: number;
    streak: number;
  }[];
  startDate: string;
  endDate: string;
  metric: 'compliance' | 'volume' | 'steps' | 'workouts';
}

// ─── Auto-generate share cards from events ───────────────────────────────────

export function generateShareCard(event: {
  type: ShareableCard['type'];
  clientName: string;
  data: Record<string, string | number>;
}): ShareableCard {
  const { type, clientName, data } = event;
  const firstName = clientName.split(' ')[0];

  const configs: Record<string, { title: string; subtitle: string; stats: { label: string; value: string }[] }> = {
    transformation: {
      title: `${firstName}'s ${data.weeks || 12}-Week Transformation`,
      subtitle: `Coached on INÖ · ${data.compliance || 90}% compliance`,
      stats: [
        { label: 'Weight', value: `${data.weightChange || '-4'}kg` },
        { label: 'Body Fat', value: `${data.bfChange || '-3.2'}%` },
        { label: 'Strength', value: `+${data.strengthGain || '85'}kg total` },
      ],
    },
    pr: {
      title: 'New Personal Record',
      subtitle: `${firstName} just hit a PR on ${data.exercise || 'Bench Press'}`,
      stats: [
        { label: 'Weight', value: `${data.weight || '100'}kg` },
        { label: 'Previous', value: `${data.previous || '90'}kg` },
        { label: 'Gain', value: `+${data.gain || '10'}kg` },
      ],
    },
    streak: {
      title: `${data.days || 30}-Day Streak`,
      subtitle: `${firstName} hasn't missed a day`,
      stats: [
        { label: 'Days', value: `${data.days || 30}` },
        { label: 'Workouts', value: `${data.workouts || 25}` },
        { label: 'Compliance', value: `${data.compliance || 95}%` },
      ],
    },
    workout_summary: {
      title: `${firstName}'s Week in Review`,
      subtitle: `${data.workouts || 5} workouts · ${data.volume || '12,400'}kg volume`,
      stats: [
        { label: 'Sessions', value: `${data.workouts || 5}` },
        { label: 'Volume', value: `${data.volume || '12.4'}t` },
        { label: 'PRs', value: `${data.prs || 2}` },
      ],
    },
    challenge_rank: {
      title: `#${data.rank || 3} in ${data.challengeName || '30-Day Shred'}`,
      subtitle: `${firstName} is crushing the competition`,
      stats: [
        { label: 'Rank', value: `#${data.rank || 3}` },
        { label: 'Score', value: `${data.score || 89}pts` },
        { label: 'Of', value: `${data.totalParticipants || 142}` },
      ],
    },
    team_win: {
      title: `Team ${data.teamName || 'Alpha'} Wins!`,
      subtitle: `${firstName}'s team dominated this week`,
      stats: [
        { label: 'Team Score', value: `${data.teamScore || 450}` },
        { label: 'Members', value: `${data.members || 5}` },
        { label: 'Margin', value: `+${data.margin || 32}pts` },
      ],
    },
  };

  const config = configs[type] || configs.workout_summary;

  return {
    id: `share-${Date.now()}`,
    type,
    clientName,
    title: config.title,
    subtitle: config.subtitle,
    stats: config.stats,
    shareUrl: `https://ino.fit/s/${Date.now().toString(36)}`,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Auto-trigger rules (when to generate shareable content) ─────────────────

export interface ViralTrigger {
  event: string;
  condition: string;
  cardType: ShareableCard['type'];
}

export const VIRAL_TRIGGERS: ViralTrigger[] = [
  { event: 'pr_hit', condition: 'Any new personal record', cardType: 'pr' },
  { event: 'streak_milestone', condition: 'Streak hits 7, 14, 30, 60, 100 days', cardType: 'streak' },
  { event: 'week_complete', condition: 'All planned workouts completed', cardType: 'workout_summary' },
  { event: 'challenge_top10', condition: 'Client enters top 10 in challenge', cardType: 'challenge_rank' },
  { event: 'transformation_complete', condition: 'Program end + photos uploaded', cardType: 'transformation' },
  { event: 'team_win', condition: 'Client\'s team wins weekly competition', cardType: 'team_win' },
];
