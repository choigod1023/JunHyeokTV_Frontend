import { useState, useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import MessageInput from "../components/MessageInput";
import ChatWindow from "../components/ChatWindow";
import HLSPlayer from "../components/HLSPlayer";

const webStreaming = () => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const { width, height } = useWindowDimensions(); // 화면 크기 얻기

  const isPortrait = height >= width; // 세로 화면 여부 확인

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const socket = new SockJS("http://choigod1023.p-e.kr:8888/ws");
        const client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {},
          debug: (str) => console.log(str),
          onConnect: () => {
            setConnected(true);
            console.log("WebSocket 연결 성공");
            const onMessageReceived = (message: any) => {
              try {
                const parsedMessage = JSON.parse(message.body); // JSON 문자열을 객체로 변환
                setMessages((prev) => [...prev, parsedMessage]); // 기존 메시지 배열에 추가
              } catch (error) {
                console.error("메시지 파싱 오류:", error);
              }
            };
            client.subscribe("/topic/messages", onMessageReceived);
          },
          onDisconnect: () => {
            setConnected(false);
            console.log("WebSocket 연결 종료");
          },
        });

        client.activate();
        setStompClient(client);
      } catch (error) {
        console.error("WebSocket 연결 오류:", error);
      }
    };

    connectWebSocket();

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
      <View
        style={
          isPortrait
            ? styles.videoContainerPortrait
            : styles.videoContainerLandscape
        }
      >
        <HLSPlayer />
      </View>
      <View
        style={
          isPortrait
            ? styles.chatContainerPortrait
            : styles.chatContainerLandscape
        }
      >
        <ChatWindow connected={connected} messages={messages} />
        <MessageInput onSendMessage={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    flex: 1,
    padding: 0, // 패딩 제거
    margin: 0, // 마진 제거
    justifyContent: "center",
    position: "relative", // 부모 요소의 상대적인 위치
  },
  videoContainerPortrait: {
    width: "100%", // 동영상 영역을 화면 전체에 맞춤
    height: "50%", // 세로 화면에서는 영상이 위에 위치하도록 설정
  },
  videoContainerLandscape: {
    width: "100%", // 동영상 영역을 화면 전체에 맞춤
    height: "80%", // 가로 화면에서는 영상이 위에 위치하도록 설정
  },
  chatContainerPortrait: {
    width: "100%", // 세로 화면에서는 채팅이 아래에 위치하도록 설정
    height: "50%", // 화면 절반을 채팅 영역에 사용
    backgroundColor: "rgba(117, 117, 117, 0.7)", // 불투명도 30%
    opacity: 0.7, // 불투명도 설정
    padding: 10, // 채팅 내용에 패딩 추가
    justifyContent: "flex-end", // 채팅창 내용이 화면 아래쪽에 표시되도록 설정
  },
  chatContainerLandscape: {
    position: "absolute", // 가로 화면에서는 채팅이 영상 위에 겹치게 보이도록 설정
    top: "50%", // 영상과 겹치도록 설정
    left: 0,
    width: "100%", // 화면의 절반을 채팅에 사용
    height: "50%", // 화면 전체 높이를 사용
    backgroundColor: "rgba(117, 117, 117, 0.7)", // 불투명도 30%
    opacity: 0.7, // 불투명도 설정
    padding: 10, // 채팅 내용에 패딩 추가
    justifyContent: "flex-end", // 채팅창 내용이 화면 아래쪽에 표시되도록 설정
  },
});

export default webStreaming;
