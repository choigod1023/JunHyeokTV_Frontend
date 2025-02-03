import { useRef, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { Video } from "expo-av";
import Hls from "hls.js";
import { FontAwesome } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";

const HLSPlayer: React.FC = () => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true); // 버튼 가시성 상태
  const videoUrl = "http://choigod1023.p-e.kr:8880/hls/stream.m3u8";
  const { width, height } = useWindowDimensions(); // 화면 크기 얻기

  const isPortrait = height >= width; // 세로 화면 여부 확인
  useEffect(() => {
    if (Platform.OS === "web") {
      const videoElement = document.getElementById(
        "hls-video"
      ) as HTMLVideoElement;
      if (videoElement) {
        setIsLoading(true);
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(videoUrl);
          hls.attachMedia(videoElement);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
          });
        } else {
          videoElement.src = videoUrl;
          videoElement.onloadeddata = () => setIsLoading(false);
        }
      }
    } else {
      videoRef.current?.playAsync();
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    if (isControlsVisible) {
      const timer = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isControlsVisible]);

  const handleUserInteraction = () => {
    setIsControlsVisible(true);
  };

  const togglePlayback = async () => {
    handleUserInteraction();
    if (Platform.OS === "web") {
      const videoElement = document.getElementById(
        "hls-video"
      ) as HTMLVideoElement;
      if (videoElement) {
        if (videoElement.paused) {
          videoElement.currentTime = videoElement.duration - 0.1;
          videoElement.play();
          setIsPlaying(true);
        } else {
          videoElement.pause();
          setIsPlaying(false);
        }
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.stopAsync();
        await videoRef.current.playAsync();
        await videoRef.current.setPositionAsync(
          videoRef.current.duration - 0.1
        );
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullScreen = async () => {
    handleUserInteraction();
    if (Platform.OS === "web") {
      const videoElement = document.getElementById(
        "hls-video"
      ) as HTMLVideoElement;
      if (videoElement) {
        if (!document.fullscreenElement) {
          if (videoElement.requestFullscreen) {
            videoElement.requestFullscreen();
          } else if (videoElement.webkitRequestFullscreen) {
            videoElement.webkitRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      }
    } else {
      if (isFullScreen) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
        );
      }
      setIsFullScreen(!isFullScreen);
    }
  };

  return (
    <View
      style={[styles.container, isFullScreen && styles.fullScreenContainer]}
      onTouchStart={handleUserInteraction}
    >
      {Platform.OS === "web" ? (
        <video
          id="hls-video"
          controls
          style={styles.video}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      ) : (
        <Video
          ref={videoRef}
          source={{ uri: videoUrl, type: "m3u8" }}
          style={styles.video}
          resizeMode="contain"
          shouldPlay={isPlaying}
          useNativeControls={false}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
        />
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {isControlsVisible && (
        <>
          <TouchableOpacity
            style={
              isPortrait ? styles.playPortraitButton : styles.playPortraitButton
            }
            onPress={togglePlayback}
          >
            <FontAwesome
              name={isPlaying ? "pause" : "play"}
              size={30}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={
              isPortrait
                ? styles.fullScreenPortraitButton
                : styles.fullScreenLandscapeButton
            }
            onPress={toggleFullScreen}
          >
            <FontAwesome
              name={isFullScreen ? "compress" : "expand"}
              size={30}
              color="#fff"
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    position: "relative",
  },
  fullScreenContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  video: {
    width: "100%",
    height: "120%",
    marginBottom: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  playPortraitButton: {
    position: "absolute",
  },
  playLandscpaeButton: {
    position: "absolute",
    top: 0,
    right: 20,
  },
  fullScreenPortraitButton: {
    position: "absolute",
    top: 30,
    right: 20,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 50,
  },
  fullScreenLandscapeButton: {
    position: "absolute",
    top: 0,
    right: 20,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 50,
  },
});

export default HLSPlayer;
