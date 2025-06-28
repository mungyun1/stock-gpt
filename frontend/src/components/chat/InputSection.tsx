import React, { useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputSectionProps {
  input: string;
  isTyping: boolean;
  colors: any;
  onInputChange: (text: string) => void;
  onSend: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  input,
  isTyping,
  colors,
  onInputChange,
  onSend,
}) => {
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    onSend();
  };

  return (
    <View
      style={[
        styles.inputContainer,
        {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
        },
      ]}
    >
      <Pressable
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
        onPress={() => inputRef.current && inputRef.current.focus()}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
            },
          ]}
          placeholder={
            isTyping
              ? "응답을 기다리는 중..."
              : "Stalk에게 투자 조언을 받으세요."
          }
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={onInputChange}
          multiline
          editable={!isTyping}
          textAlignVertical="center"
          autoComplete="off"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor:
                input.trim() && !isTyping
                  ? colors.accent
                  : colors.cardBackground,
              opacity: !input.trim() || isTyping ? 0.5 : 1,
            },
          ]}
          onPress={handleSend}
          disabled={!input.trim() || isTyping}
        >
          <Ionicons
            name={isTyping ? "time-outline" : "arrow-forward"}
            size={14}
            color={input.trim() && !isTyping ? "#FFFFFF" : colors.textSecondary}
          />
        </TouchableOpacity>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderTopWidth: 1,
    padding: 12,
    width: "100%",
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Pretendard-Regular",
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 18,
    maxHeight: 100,
    lineHeight: 18,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
});
