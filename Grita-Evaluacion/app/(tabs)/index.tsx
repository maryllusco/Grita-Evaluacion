import { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { Audio } from "expo-av";

export default function HomeScreen() {
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const colors = [
    "#090202", // vacío
    "#2b0005", // duda intensa
    "#5a0204", // clamor oscuro
    "#8f1208", // fuego creciente
    "#c25b1a", // casi luz
    "#f2c36a", // dorado tibio
    "#fef1c0", // luz dorada final
  ];

  useEffect(() => {
    let recording: Audio.Recording | null = null;
    let interval: NodeJS.Timeout | null = null;

    const start = async () => {
      try {
        await Audio.requestPermissionsAsync();

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        recording = new Audio.Recording();

        await recording.prepareToRecordAsync({
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          isMeteringEnabled: true,
        });

        await recording.startAsync();

        interval = setInterval(async () => {
          if (!recording) return;

          const status = await recording.getStatusAsync();

          if (status.metering !== undefined) {
            const volume = status.metering;

            // 🔊 TERMÓMETRO DE VOZ - muy difícil, requiere grito serio
            if (volume > -44) {
              setStage((prev) => Math.min(prev + 1, 6));
            } else {
              // Vuelve al inicio cuando cesa el ruido
              setStage(0);
            }
          }
        }, 1500);
      } catch (e) {
        console.log(e);
      }
    };

    start();

    return () => {
      if (interval) clearInterval(interval);
      if (recording) recording.stopAndUnloadAsync();
    };
  }, []);

  // 🎭 MENSAJES
  useEffect(() => {
    const messages = [
      "",
      "¿Estás ahí Dios?",
      "Te necesito...",
      "No puedo solo",
      "¡Escúchame!",
      "Siento tu presencia cerca...",
      "Dios:Aquí estoy, te escuché en tu clamor. No estás solo, yo estoy contigo y te sostendré.",
    ];

    setMessage(messages[stage]);

    // ✨ animación texto
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: stage === 6 ? 1500 : 500,
      useNativeDriver: true,
    }).start();

    // 🌈 animación fondo
    Animated.timing(bgAnim, {
      toValue: stage,
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [stage]);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6],
    outputRange: colors,
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Animated.Text
        style={[
          styles.text,
          {
            opacity: fadeAnim,
            transform: [
              {
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
            color: stage >= 1 && stage <= 5 ? "#ff0000" : stage === 6 ? "#000000" : "#ffffff",
            fontWeight: stage >= 1 ? "700" : "300",
            fontFamily: stage === 6 ? "Georgia" : undefined,
            textShadowColor: stage === 6 ? "rgba(0, 0, 0, 0.2)" : "rgba(0,0,0,0.3)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: stage === 6 ? 4 : 2,
          },
        ]}
      >
        {message}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 32,
    textAlign: "center",
    paddingHorizontal: 30,
    fontWeight: "300",
    letterSpacing: 1,
  },
});