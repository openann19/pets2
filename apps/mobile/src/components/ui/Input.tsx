import React, { useMemo } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "@/theme";
import { Text } from "./Text";

export interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(function Input(
  { label, helperText, errorText, style, editable = true, ...rest }: InputProps,
  ref,
) {
  const { colors, radii, spacing } = useTheme();

  const hasError = typeof errorText === "string" && errorText.length > 0;
  const hasHelper = typeof helperText === "string" && helperText.length > 0;

  const borderColor = useMemo(() => {
    if (hasError) {
      return colors.danger;
    }
    if (!editable) {
      return colors.border;
    }
    return colors.primary;
  }, [colors.border, colors.danger, colors.primary, editable, hasError]);

  const inputStyle = StyleSheet.compose(styles.input, [
    {
      backgroundColor: editable ? colors.surface : colors.surface,
      borderColor,
      borderRadius: radii.md,
      color: colors.onSurface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    style,
  ]);

  return (
    <View style={styles.wrapper}>
      {typeof label === "string" && label.length > 0 ? (
        <Text
          variant="callout"
          tone="textMuted"
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </Text>
      ) : null}

      <TextInput
        ref={ref}
        style={inputStyle}
        editable={editable}
        placeholderTextColor={colors.onMuted}
        {...rest}
      />

      {hasError ? (
        <Text variant="caption" tone="danger" style={{ marginTop: spacing.xs }}>
          {errorText}
        </Text>
      ) : hasHelper ? (
        <Text
          variant="caption"
          tone="textMuted"
          style={{ marginTop: spacing.xs }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  input: {
    borderWidth: 1,
    fontSize: 16,
  },
});
