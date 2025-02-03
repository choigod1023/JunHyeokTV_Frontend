import React, { useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

interface ChatMessage {
  message: string;
}

interface ChatWindowProps {
  connected: boolean; // connected props 추가
  messages: ChatMessage[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ connected, messages }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]); // messages가 업데이트될 때마다 실행

  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      <Text style={styles.chatInfo}>
        {connected ? "채팅방에 연결되었습니다." : "채팅방 연결이 끊겼습니다."}
      </Text>
      <View style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <View key={index} style={styles.messageBubble}>
            <Text>{msg.message}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chatInfo: {
    color: "white",
    marginVertical: 10, // "채팅방 연결" 텍스트와 대화 말풍선 간격 추가
    textAlign: "center",
    fontWeight: "bold",
  },
  container: {
    margin: 0,
    flex: 1,
    padding: 5,
  },
  messagesContainer: {
    marginTop: 40, // "채팅방 연결" 메시지 아래로 대화 말풍선들이 겹치지 않게 하기 위해 여백 추가
  },
  messageBubble: {
    backgroundColor: "#e1f5fe",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
});

export default ChatWindow;
