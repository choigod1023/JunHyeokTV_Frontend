import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import MessageInput from "./MessageInput";
import ChatWindow from "./ChatWindow";
import HLSPlayer from "./HLSPlayer";

const LandscapeWebStreaming = () => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const socket = new SockJS("http://choigod1023.p-e.kr:8888/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        setConnected(true);
        console.log("WebSocket 연결 성공");
        client.subscribe("/topic/messages", (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            setMessages((prev) => [...prev, parsedMessage]);
          } catch (error) {
            console.error("메시지 파싱 오류:", error);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
        console.log("WebSocket 연결 종료");
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      stompClient?.deactivate();
    };
  }, []);

  const sendMessage = (message: string) => {
    if (stompClient && connected) {
      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify({ message }),
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* 비디오 영역 */}
      <View style={styles.videoContainer}>
        <HLSPlayer />
      </View>

      {/* 채팅 영역 */}
      <View style={styles.chatContainer}>
        <ChatWindow connected={connected} messages={messages} />
        <MessageInput onSendMessage={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    flexDirection: "row",
  },
  videoContainer: {
    width: "70%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  chatContainer: {
    width: "30%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    justifyContent: "flex-end",
  },
});

export default LandscapeWebStreaming;
