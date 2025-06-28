import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Thread } from "../../types/chat";

interface SidebarProps {
  isOpen: boolean;
  threads: Thread[];
  threadId: string | null;
  editingThreadId: string | null;
  editingTitle: string;
  colors: any;
  sidebarAnimation: Animated.Value;
  SIDEBAR_WIDTH: number;
  onClose: () => void;
  onThreadSelect: (thread: Thread) => void;
  onCreateNewThread: () => void;
  onDeleteThread: (thread: Thread) => void;
  onStartEditingTitle: (thread: Thread) => void;
  onSaveThreadTitle: (threadId: string, title: string) => void;
  onCancelEditingTitle: () => void;
  onEditingTitleChange: (title: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  threads,
  threadId,
  editingThreadId,
  editingTitle,
  colors,
  sidebarAnimation,
  SIDEBAR_WIDTH,
  onClose,
  onThreadSelect,
  onCreateNewThread,
  onDeleteThread,
  onStartEditingTitle,
  onSaveThreadTitle,
  onCancelEditingTitle,
  onEditingTitleChange,
}) => {
  const titleInputRef = useRef<TextInput>(null);

  const confirmDeleteThread = (thread: Thread) => {
    Alert.alert(
      "대화 삭제",
      `"${thread.title}" 대화를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => onDeleteThread(thread),
        },
      ]
    );
  };

  const handleStartEditingTitle = (thread: Thread) => {
    onStartEditingTitle(thread);
    // 다음 프레임에서 포커스
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  };

  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          backgroundColor: colors.background,
          transform: [{ translateX: sidebarAnimation }],
          width: SIDEBAR_WIDTH,
        },
      ]}
    >
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View style={styles.sidebarContent}>
          <View
            style={[
              styles.sidebarHeader,
              {
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.headerContent}>
              <Text
                style={[styles.sidebarTitle, { color: colors.textPrimary }]}
              >
                대화 목록 ({threads.length})
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={colors.textSecondary}
                  style={{ opacity: 0.6 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={[
              styles.threadList,
              { backgroundColor: colors.cardBackground },
            ]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.threadListContent}
          >
            {threads.map((thread) => (
              <TouchableOpacity
                key={thread.id}
                style={[
                  styles.threadItem,
                  {
                    borderBottomColor: colors.border,
                    backgroundColor:
                      thread.id === threadId
                        ? `${colors.accent}08`
                        : "transparent",
                  },
                ]}
                onPress={() => onThreadSelect(thread)}
              >
                <View style={styles.threadItemInner}>
                  <View
                    style={[
                      styles.threadIconContainer,
                      {
                        backgroundColor:
                          thread.id === threadId
                            ? `${colors.accent}15`
                            : `${colors.accent}08`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={15}
                      color={colors.accent}
                      style={{
                        opacity: thread.id === threadId ? 1 : 0.8,
                      }}
                    />
                  </View>
                  <View style={styles.threadTextContainer}>
                    {editingThreadId === thread.id ? (
                      <TextInput
                        ref={titleInputRef}
                        style={[
                          styles.threadTitleInput,
                          {
                            color: colors.textPrimary,
                            borderColor: colors.accent,
                          },
                        ]}
                        value={editingTitle}
                        onChangeText={onEditingTitleChange}
                        onBlur={() =>
                          onSaveThreadTitle(thread.id, editingTitle)
                        }
                        onSubmitEditing={() =>
                          onSaveThreadTitle(thread.id, editingTitle)
                        }
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === "Escape") {
                            onCancelEditingTitle();
                          }
                        }}
                        autoFocus
                        selectTextOnFocus
                        maxLength={30}
                        placeholder="제목을 입력하세요"
                        placeholderTextColor={colors.textSecondary}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.threadTitle,
                          {
                            color: colors.textPrimary,
                            opacity: thread.id === threadId ? 1 : 0.9,
                          },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {thread.title || "새로운 대화"}
                      </Text>
                    )}
                    {thread.last_message && (
                      <Text
                        style={[
                          styles.threadLastMessage,
                          {
                            color: colors.textSecondary,
                            opacity: thread.id === threadId ? 0.8 : 0.6,
                          },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {thread.last_message}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.threadActions}>
                  {editingThreadId !== thread.id && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleStartEditingTitle(thread)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color={colors.accent}
                        style={{ opacity: 0.7 }}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDeleteThread(thread)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      color={colors.textSecondary}
                      style={{ opacity: 0.4 }}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.newChatButton,
              {
                backgroundColor: `${colors.accent}08`,
              },
            ]}
            onPress={onCreateNewThread}
          >
            <View style={styles.newChatButtonContent}>
              <Ionicons name="add-circle" size={17} color={colors.accent} />
              <Text
                style={[styles.newChatButtonText, { color: colors.accent }]}
              >
                새로운 대화
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sidebarContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  sidebarHeader: {
    padding: 16,
    height: 68,
    borderBottomWidth: 0.5,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sidebarTitle: {
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
    letterSpacing: -0.3,
    opacity: 0.9,
  },
  closeButton: {
    padding: 4,
  },
  threadList: {
    flex: 1,
  },
  threadListContent: {
    paddingVertical: 4,
  },
  threadItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    paddingRight: 12,
  },
  threadItemInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
  },
  threadIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  threadTextContainer: {
    flex: 1,
  },
  threadTitle: {
    fontSize: 15,
    fontFamily: "Pretendard-Medium",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  threadLastMessage: {
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
    opacity: 0.7,
  },
  threadTitleInput: {
    fontSize: 15,
    fontFamily: "Pretendard-Medium",
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
  },
  threadActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    padding: 8,
    opacity: 0.8,
  },
  deleteButton: {
    padding: 8,
    opacity: 0.8,
  },
  newChatButton: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  newChatButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  newChatButtonText: {
    fontSize: 15,
    fontFamily: "Pretendard-SemiBold",
    letterSpacing: -0.3,
  },
});
