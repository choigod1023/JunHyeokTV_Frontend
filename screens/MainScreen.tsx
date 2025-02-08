import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import WebStreaming from "../components/webStreaming";
import { StatusBar } from "expo-status-bar";

const MainScreen = () => {
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    const checkOrientation = async () => {
      const orientation = await ScreenOrientation.getOrientationAsync();
      setIsPortrait(
        orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
          orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
      );
    };

    // 화면 회전 감지 리스너 추가
    const subscription = ScreenOrientation.addOrientationChangeListener(
      (event) => {
        setIsPortrait(
          event.orientationInfo.orientation ===
            ScreenOrientation.Orientation.PORTRAIT_UP ||
            event.orientationInfo.orientation ===
              ScreenOrientation.Orientation.PORTRAIT_DOWN
        );
      }
    );

    checkOrientation();

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="black" />
      <View style={styles.container}>
        {/* ✅ 하나의 컴포넌트(WebStreaming)만 유지하고, isPortrait에 따라 레이아웃 변경 */}
        <WebStreaming isPortrait={isPortrait} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});

export default MainScreen;
