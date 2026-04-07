import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const [message, setMessage] = useState("");
  const [holdTime, setHoldTime] = useState(0);

  useEffect(() => {
    let interval: any;

    const start = async () => {
      try {
        await Audio.requestPermissionsAsync();

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        interval = setInterval(() => {
          const fakeVolume = Math.random();

          //  UMBRALES (podés ajustar)
          const LOW = 0.5;
          const HIGH = 0.75;

          if (fakeVolume < LOW) {
            // silencio → reset total
            setHoldTime(0);
            setMessage("");
          } else if (fakeVolume < HIGH) {
            // voz media (no suma mucho)
            setMessage("¿Estás ahí?");
          } else {
            // voz fuerte → suma tiempo
            setHoldTime((prev) => prev + 1);
          }
        }, 800);
      } catch (e) {
        console.log(e);
      }
    };

    start();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // progreso SOLO si mantiene el esfuerzo
  useEffect(() => {
    if (holdTime === 2) {
      setMessage("Te necesito");
    } else if (holdTime === 4) {
      setMessage("No puedo solo");
    } else if (holdTime >= 6) {
      setMessage("¡Sálvame!");
    }
  }, [holdTime]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 28,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
