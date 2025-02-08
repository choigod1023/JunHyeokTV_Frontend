import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import MessageInput from "./MessageInput";
import ChatWindow from "./ChatWindow";
import HLSPlayer from "./HLSPlayer";

interface WebStreamingProps {
  isPortrait: boolean;
}

const WebStreaming: React.FC<WebStreamingProps> = ({ isPortrait }) => {
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
    <View
      style={[
        styles.container,
        isPortrait ? styles.portrait : styles.landscape,
      ]}
    >
      <View style={styles.videoContainer}>
        <HLSPlayer />
      </View>
      <View style={styles.chatContainer}>
        <ChatWindow connected={true} messages={messages} />
        <MessageInput onSendMessage={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  portrait: {
    flexDirection: "column", // 세로 모드 (영상 위, 채팅 아래)
  },
  landscape: {
    flexDirection: "row", // 가로 모드 (영상 왼쪽, 채팅 오른쪽)
  },
  videoContainer: {
    flex: 2,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#111",
  },
});

export default WebStreaming;
