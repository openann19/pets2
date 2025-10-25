import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import EliteButton from "../buttons/EliteButton";
import { FadeInUp } from "../PremiumComponents";
import { tokens } from "@pawfectmatch/design-tokens";

interface QuickRepliesProps {
  replies: string[];
  onReplySelect: (reply: string) => void;
  visible?: boolean;
}

const DEFAULT_REPLIES = [
  "Sounds good! 👍",
  "When works for you?",
  "Let's do it! 🎾",
  "Perfect! 😊",
];

export function QuickReplies({
  replies = DEFAULT_REPLIES,
  onReplySelect,
  visible = true,
}: QuickRepliesProps): React.JSX.Element | null {
  if (!visible || replies.length === 0) return null;

  const renderReply = ({ item, index }: { item: string; index: number }) => (
    <FadeInUp delay={index * 100}>
      <EliteButton
        title={item}
        variant="glass"
        size="sm"
        magnetic={true}
        ripple={true}
        onPress={() => {
          onReplySelect(item);
        }}
        style={styles.quickReply}
      />
    </FadeInUp>
  );

  const keyExtractor = (item: string, index: number) => index.toString();

  return (
    <FadeInUp delay={0}>
      <View style={styles.container}>
        <FlatList
          data={replies}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderReply}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.repliesList}
        />
      </View>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  repliesList: {
    paddingHorizontal: tokens.spacing.xs,
  },
  quickReply: {
    backgroundColor: "#fff",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.xl,
    marginRight: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
