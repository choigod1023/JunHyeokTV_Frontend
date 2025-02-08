import { useRef, useEffect, useState } from "react";
import {
  View,
  Platform,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Video } from "expo-av";
import Hls from "hls.js";
import { AntDesign } from "@expo/vector-icons";

const HLSPlayer: React.FC = () => {
  const videoRef = useRef<Video>(null);
  const videoUrl = "http://choigod1023.p-e.kr:8880/hls/stream.m3u8";
  const [isPlaying, setIsPlaying] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false); // ✅ 버퍼링 상태 추가
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  useEffect(() => {
    if (Platform.OS === "web") {
      const videoElement = document.getElementById(
        "hls-video"
      ) as HTMLVideoElement;
      if (videoElement) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(videoUrl);
          hls.attachMedia(videoElement);
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              setIsError(true);
              console.error("HLS Error:", data);
            }
          });
          hls.on(Hls.Events.BUFFER_STALLED, () => {
            setIsBuffering(true);
          });
          hls.on(Hls.Events.BUFFER_APPENDED, () => {
            setIsBuffering(false);
          });
          hls.startLoad();
        } else {
          videoElement.src = videoUrl;
        }
      } else {
        console.error("Video element not found on web.");
      }
    }
  }, []);

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
      setShowControls(true);
    }
  };

  const handleTouch = () => {
    setShowControls(true);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleTouch}
      activeOpacity={1}
    >
      {Platform.OS === "web" ? (
        <video
          id="hls-video"
          style={styles.video}
          playsInline
          autoPlay
          controls
        />
      ) : (
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          useNativeControls={false}
          resizeMode="contain"
          onError={() => setIsError(true)}
          onLoad={() => console.log("Video loaded")}
          onBuffer={({ isBuffering }) => setIsBuffering(isBuffering)} // ✅ 버퍼링 감지
        />
      )}

      {showControls && (
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <AntDesign
            name={isPlaying ? "pausecircleo" : "playcircleo"}
            size={50}
            color="white"
          />
        </TouchableOpacity>
      )}

      {isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            영상 재생 중 오류가 발생했습니다.
          </Text>
        </View>
      )}

      {/* ✅ 버퍼링 화면 추가 */}
      {isBuffering && (
        <View style={styles.bufferingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.bufferingText}>버퍼링 중입니다...</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "50%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    position: "absolute",
    bottom: "45%",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  errorContainer: {
    position: "absolute",
    bottom: "45%",
    left: "40%",
    alignSelf: "center",
    transform: [{ translateX: -75 }, { translateY: -25 }],
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject, // ✅ 전체 화면 덮기
    backgroundColor: "rgba(0, 0, 0, 0.5)", // ✅ 흐리게 처리
    justifyContent: "center",
    alignItems: "center",
  },
  bufferingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
  },
});

export default HLSPlayer;
