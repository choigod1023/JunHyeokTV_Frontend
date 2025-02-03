import {
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc"; // React Native

// 미디어 스트림 가져오기
export const getUserMedia = async (): Promise<MediaStream | null> => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  } catch (error) {
    console.error("Error accessing media devices:", error);
    return null;
  }
};

// PeerConnection 생성
export const createPeerConnection = (): RTCPeerConnection => {
  const config: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };
  return new RTCPeerConnection(config);
};
