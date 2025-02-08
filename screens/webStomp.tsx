import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useNavigation, ParamListBase } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

const App = () => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        // SockJS를 사용하여 WebSocket 연결
        const socket = new SockJS("http://choigod1023.p-e.kr:8888/ws"); // 서버 주소
        console.log("SockJS 생성:", socket);

        const client = new Client({
          webSocketFactory: () => socket, // SockJS를 사용하여 WebSocket 연결
          connectHeaders: {},
          debug: (str) => {
            console.log(str); // 디버깅용 메시지
          },
          onConnect: () => {
            setConnected(true);
            console.log("WebSocket 연결 성공");

            // 메시지 구독
            client.subscribe("/topic/messages", (message) => {});
          },
          onDisconnect: () => {
            setConnected(false);
            console.log("WebSocket 연결 종료");
          },
        });

        client.activate(); // WebSocket 연결 활성화
        setStompClient(client);
      } catch (error) {
        console.error("WebSocket 연결 오류:", error);
      }
    };

    connectWebSocket();

    // 클린업: 컴포넌트가 언마운트 될 때 WebSocket 연결 해제
    return () => {
      if (stompClient) {
        stompClient.deactivate(); // WebSocket 연결 종료
      }
    };
  }, []);

  // 메시지 전송 함수
  const sendMessage = () => {
    if (stompClient && connected) {
      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify({ message: "World" }), // 서버로 보낼 메시지 내용
      });
    }
  };
  const gotoWebStreaming = () => {
    navigation.navigate("mainScreen");
  };
  return (
    <View>
      <Text>{connected ? "WebSocket 연결됨" : "WebSocket 연결 안 됨"}</Text>
      <Button title="메시지 보내기" onPress={sendMessage} />
      <Button title="streaming 이동하기" onPress={gotoWebStreaming} />
    </View>
  );
};

export default App;
