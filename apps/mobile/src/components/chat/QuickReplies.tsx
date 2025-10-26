import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { EliteButton, FadeInUp } from "../EliteComponents";

interface QuickRepliesProps {
  replies: string[];
  onReplySelect: (reply: string) => void;
  visible?: boolean;
}

export const DEFAULT_REPLIES = [
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
        magnetic
        ripple
        onPress={() => {
          onReplySelect(item);
        }}
        style={[styles.quickReply]}
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
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  repliesList: {
    paddingHorizontal: 4,
  },
  quickReply: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#0a0a0a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
