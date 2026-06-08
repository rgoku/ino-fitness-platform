import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Design Tokens ──────────────────────────────────────────────────────────

const colors = {
  bg: '#0A0F1E',
  surface: '#0C1220',
  border: '#1E293B',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  brand: '#2563EB',
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  details?: string;
  sources?: string[];
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const quickChips = [
  'Why protein?',
  'Pre-workout meal?',
  'Post-workout?',
  'Hydration?',
  'Supplements?',
];

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    text: 'Why is protein important for muscle growth?',
  },
  {
    id: '2',
    role: 'assistant',
    text: 'Protein provides the amino acids your muscles need to repair and grow after training. Aim for 1.6-2.2g per kg of body weight daily, spread across 3-5 meals for optimal muscle protein synthesis.',
    details:
      'Muscle protein synthesis (MPS) is elevated for 24-48 hours post-exercise. Leucine, found abundantly in whey and animal proteins, is the primary trigger for MPS. Research shows that distributing protein intake evenly throughout the day (every 3-5 hours) maximizes the anabolic response compared to skewing intake toward a single meal.',
    sources: ['Schoenfeld 2018', 'ISSN Position Stand'],
  },
  {
    id: '3',
    role: 'user',
    text: 'What should I eat before a workout?',
  },
  {
    id: '4',
    role: 'assistant',
    text: 'Eat a balanced meal with carbs and protein 2-3 hours before training, or a light snack 30-60 minutes prior. Carbs fuel performance while protein primes muscle recovery.',
    details:
      'Pre-workout nutrition should prioritize easily digestible carbohydrates (e.g., rice, oats, banana) to top off glycogen stores. Adding 20-40g protein helps reduce muscle breakdown during exercise. Avoid high-fat or high-fiber foods close to training as they slow digestion and may cause discomfort. If training fasted, consider at least 10g EAAs or BCAAs.',
    sources: ['Kerksick et al. 2017', 'ISSN Position Stand'],
  },
];

// ─── Components ─────────────────────────────────────────────────────────────

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, [dot1, dot2, dot3]);

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, dotStyle(dot1)]} />
      <Animated.View style={[styles.typingDot, dotStyle(dot2)]} />
      <Animated.View style={[styles.typingDot, dotStyle(dot3)]} />
    </View>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <View style={styles.userBubbleRow}>
      <View style={styles.userBubble}>
        <Text style={styles.userBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

function AssistantCard({ message }: { message: Message }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.assistantCard}>
      <Text style={styles.assistantText}>{message.text}</Text>
      {message.details && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
          style={styles.learnMoreButton}
        >
          <Text style={styles.learnMoreText}>
            {expanded ? 'Show less ▲' : 'Learn more ▼'}
          </Text>
        </TouchableOpacity>
      )}
      {expanded && message.details && (
        <Text style={styles.detailsText}>{message.details}</Text>
      )}
      {message.sources && message.sources.length > 0 && (
        <View style={styles.sourcesRow}>
          {message.sources.map((source) => (
            <View key={source} style={styles.sourceBadge}>
              <Text style={styles.sourceBadgeText}>{source}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Great question! Based on current research, I recommend consulting with your coach for a personalized answer tailored to your training program and goals.',
        sources: ['General Guidance'],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000);
  };

  const handleChipPress = (chip: string) => {
    setInputText(chip);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ AI Assistant</Text>
      </View>

      {/* Quick Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {quickChips.map((chip) => (
          <TouchableOpacity
            key={chip}
            style={styles.chip}
            activeOpacity={0.7}
            onPress={() => handleChipPress(chip)}
          >
            <Text style={styles.chipText}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chat Messages */}
      <ScrollView
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) =>
          message.role === 'user' ? (
            <UserBubble key={message.id} text={message.text} />
          ) : (
            <AssistantCard key={message.id} message={message} />
          )
        )}
        {isTyping && (
          <View style={styles.assistantCard}>
            <TypingIndicator />
          </View>
        )}
      </ScrollView>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        Powered by AI · Not medical advice
      </Text>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask anything about fitness..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          activeOpacity={0.7}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>↑</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // Quick Chips
  chipsScroll: {
    maxHeight: 44,
    marginBottom: 8,
  },
  chipsContent: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Chat
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  // User Bubble
  userBubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: colors.brand,
    borderRadius: 12,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  userBubbleText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 21,
  },
  // Assistant Card
  assistantCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    maxWidth: '90%',
  },
  assistantText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  learnMoreButton: {
    marginTop: 10,
  },
  learnMoreText: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: '600',
  },
  detailsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 10,
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  sourceBadge: {
    backgroundColor: 'rgba(37,99,235,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sourceBadgeText: {
    fontSize: 11,
    color: colors.brand,
    fontWeight: '500',
  },
  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  // Disclaimer
  disclaimer: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 6,
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 34,
    paddingTop: 8,
    gap: 10,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
