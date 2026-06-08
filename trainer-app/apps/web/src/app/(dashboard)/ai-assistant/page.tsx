'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Droplets,
  Pill,
  Utensils,
  Dumbbell,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- Types ---

type AIResponse = {
  id: string;
  question: string;
  shortAnswer: string;
  expandedAnswer: string;
  sources: string[];
  timestamp: string;
};

// --- Mock Data ---

const presetQuestions = [
  { id: 'protein', label: 'Why protein?', icon: Dumbbell },
  { id: 'pre-workout', label: 'Pre-workout meal?', icon: Utensils },
  { id: 'post-workout', label: 'Post-workout?', icon: Zap },
  { id: 'hydration', label: 'Hydration?', icon: Droplets },
  { id: 'supplements', label: 'Supplements?', icon: Pill },
];

const mockResponses: Record<string, Omit<AIResponse, 'id' | 'timestamp'>> = {
  protein: {
    question: 'Why is protein important for muscle growth?',
    shortAnswer:
      'Protein provides amino acids that repair and build muscle fibers damaged during training. Aim for 1.6-2.2g per kg of bodyweight daily, spread across 4-5 meals for optimal muscle protein synthesis.',
    expandedAnswer:
      'Muscle protein synthesis (MPS) is the process by which your body repairs and builds new muscle tissue. After resistance training, MPS is elevated for 24-48 hours. Consuming adequate protein during this window maximizes gains. Leucine, found abundantly in whey and animal proteins, is the primary trigger for MPS. Research shows that 20-40g of protein per meal is optimal for most individuals. Spacing protein intake every 3-4 hours maintains elevated MPS throughout the day. Plant-based athletes may need slightly higher total intake (2.0-2.4g/kg) due to lower leucine content and digestibility of plant proteins.',
    sources: ['Schoenfeld & Aragon, 2018', 'Morton et al., 2018', 'ISSN Position Stand'],
  },
  'pre-workout': {
    question: 'What should I eat before a workout?',
    shortAnswer:
      'Eat a balanced meal with carbs and moderate protein 2-3 hours before training. If closer to workout time, go lighter: a banana with some peanut butter or a small protein shake works great 30-60 minutes out.',
    expandedAnswer:
      'Pre-workout nutrition serves two purposes: fueling performance and preventing muscle breakdown. Carbohydrates top off glycogen stores, which are your primary fuel during moderate-to-high intensity exercise. Protein before training has been shown to increase amino acid delivery to muscles during the session. Fat should be limited close to training as it slows digestion. For morning exercisers who train fasted, at minimum consume 20-30g of fast-digesting protein (whey) to reduce muscle protein breakdown. Caffeine (3-6mg/kg) taken 30-60 minutes pre-workout can enhance performance by 2-5% in most individuals.',
    sources: ['Kerksick et al., 2017', 'ISSN Nutrient Timing', 'Stark et al., 2012'],
  },
  'post-workout': {
    question: 'What should I eat after a workout?',
    shortAnswer:
      'Within 1-2 hours post-training, have 20-40g protein with 0.5-1g/kg carbs. The "anabolic window" is wider than once thought, but don\'t wait too long if you trained fasted or it\'s been 4+ hours since eating.',
    expandedAnswer:
      'Post-workout nutrition priorities: (1) Replenish glycogen with carbohydrates, especially if you train again within 8 hours. High-glycemic carbs can accelerate this process. (2) Provide amino acids for muscle repair via 20-40g of quality protein. (3) Rehydrate - aim for 1.5L of fluid per kg of body weight lost during training. The urgency of post-workout nutrition depends on your pre-workout meal timing. If you ate 2-3 hours before training, you have a comfortable window of 1-2 hours post-exercise. If you trained fasted, prioritize eating within 30-60 minutes. Chocolate milk is surprisingly effective as a recovery drink due to its carb-to-protein ratio.',
    sources: ['Aragon & Schoenfeld, 2013', 'Kerksick et al., 2017', 'Thomas et al., 2016'],
  },
  hydration: {
    question: 'How much water should I drink?',
    shortAnswer:
      'A good baseline is 35-40ml per kg of bodyweight daily, plus 500-750ml extra per hour of exercise. Check your urine: pale yellow means well-hydrated. During intense training, consider adding electrolytes.',
    expandedAnswer:
      'Hydration needs are highly individual and depend on body size, activity level, climate, and sweat rate. General guidelines: drink 400-600ml of water 2 hours before exercise, 150-250ml every 15-20 minutes during exercise, and 1.5x the fluid lost after exercise. For sessions over 60 minutes or in hot conditions, add sodium (500-700mg/L) to your drink to maintain electrolyte balance and enhance fluid retention. Signs of dehydration include dark urine, headaches, fatigue, and decreased performance. Even 2% dehydration can reduce exercise performance by up to 25%. Overhydration (hyponatremia) is also a risk during ultra-endurance events - drink to thirst rather than forcing excessive intake.',
    sources: ['ACSM Position Stand, 2007', 'Sawka et al., 2007', 'Cheuvront & Kenefick, 2014'],
  },
  supplements: {
    question: 'Which supplements actually work?',
    shortAnswer:
      'The most evidence-backed supplements are creatine monohydrate (5g/day), caffeine (3-6mg/kg pre-workout), and vitamin D if deficient. Everything else is either situational or has weak evidence. Save your money on most "proprietary blends."',
    expandedAnswer:
      'Tier 1 (Strong evidence): Creatine monohydrate increases strength, power, and lean mass. Take 5g daily - loading phases are optional. Caffeine enhances endurance and strength performance. Vitamin D supplementation (1000-4000 IU/day) for those with low levels improves muscle function. Tier 2 (Moderate evidence): Beta-alanine (3-6g/day) for activities lasting 1-4 minutes. Citrulline malate (6-8g) for blood flow and endurance. Omega-3 fatty acids (2-3g EPA+DHA) for recovery and inflammation. Tier 3 (Situational): BCAAs are unnecessary if protein intake is adequate. Pre-workout blends often under-dose effective ingredients. Testosterone boosters have negligible effects. Always check third-party testing (NSF, Informed Sport) for banned substances.',
    sources: ['Kreider et al., 2017', 'ISSN Position Stand', 'Maughan et al., 2018'],
  },
};

export default function AIAssistantPage() {
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [customQuestion, setCustomQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handlePresetClick = (presetId: string) => {
    const data = mockResponses[presetId];
    if (!data) return;

    setIsTyping(true);
    setTimeout(() => {
      const newResponse: AIResponse = {
        id: `${presetId}-${Date.now()}`,
        ...data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setResponses((prev) => [newResponse, ...prev]);
      setIsTyping(false);
    }, 800);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsTyping(true);
    const question = customQuestion;
    setCustomQuestion('');

    setTimeout(() => {
      const newResponse: AIResponse = {
        id: `custom-${Date.now()}`,
        question,
        shortAnswer:
          'Based on current evidence, this depends on individual factors like training status, goals, and current nutrition. I recommend discussing specifics with your coach for a personalized answer.',
        expandedAnswer:
          'Nutrition science is highly context-dependent. Factors that influence recommendations include: your current body composition and goals, training frequency and intensity, metabolic health markers, food preferences and restrictions, and budget constraints. General guidelines exist, but optimal protocols vary significantly between individuals. A registered dietitian or qualified nutrition coach can provide evidence-based recommendations tailored to your specific situation.',
        sources: ['General nutrition principles'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setResponses((prev) => [newResponse, ...prev]);
      setIsTyping(false);
    }, 1000);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.6rem] font-semibold tracking-tight text-[var(--color-text-primary)]">
            AI Quick Response Bot
          </h1>
          <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
            Evidence-based nutrition answers to send your clients
          </p>
        </div>
        <Badge variant="brand" dot>
          <Sparkles size={12} className="mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Quick Ask Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-body-sm">Quick Ask</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {presetQuestions.map((preset) => {
              const Icon = preset.icon;
              return (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  icon={<Icon size={14} />}
                  onClick={() => handlePresetClick(preset.id)}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Question Input */}
      <Card>
        <CardContent className="py-4">
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask a nutrition question..."
              className={cn(
                'flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2',
                'text-body-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                'transition-all duration-150'
              )}
            />
            <Button
              type="submit"
              variant="primary"
              icon={<Send size={14} />}
              disabled={!customQuestion.trim()}
            >
              Ask
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Typing Indicator */}
      {isTyping && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-body-xs text-[var(--color-text-tertiary)]">AI is thinking...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Cards */}
      <div className="space-y-4">
        {responses.map((response) => {
          const isExpanded = expandedIds.has(response.id);
          return (
            <Card key={response.id}>
              <CardContent className="py-4 space-y-3">
                {/* Question */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-body-sm font-medium text-[var(--color-text-primary)]">{response.question}</p>
                  </div>
                  <span className="text-body-xs text-[var(--color-text-tertiary)] tabular-nums shrink-0">
                    {response.timestamp}
                  </span>
                </div>

                {/* Short Answer */}
                <div className="ml-6 p-3 rounded-lg bg-[var(--color-surface-tertiary)]">
                  <p className="text-body-sm text-[var(--color-text-primary)] leading-relaxed">
                    {response.shortAnswer}
                  </p>
                </div>

                {/* Expand Section */}
                <div className="ml-6">
                  <button
                    onClick={() => toggleExpanded(response.id)}
                    className="flex items-center gap-1.5 text-body-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={14} />
                        Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        Want to learn more?
                      </>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 animate-slide-up">
                      <p className="text-body-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {response.expandedAnswer}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {response.sources.map((source, i) => (
                          <Badge key={i} variant="outline">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Send to Client Button */}
                <div className="ml-6 pt-2 border-t border-[var(--color-border-light)]">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Send size={12} />}
                    onClick={() => {}}
                  >
                    Send to Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {responses.length === 0 && !isTyping && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MessageSquare size={32} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
            <p className="text-body-sm font-medium text-[var(--color-text-primary)]">No responses yet</p>
            <p className="text-body-xs text-[var(--color-text-tertiary)] mt-1">
              Tap a quick-ask button above or type a custom question to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
