import React, { useEffect, useState, useRef } from "react";
import { View, Text, Button } from "react-native";
import Slider from "@react-native-community/slider";  // ✅ correct import
import { Audio, AVPlaybackStatus } from "expo-av";

type AudioPlayerProps = {
  source: string; // URL or local file path
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ source }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: source });
        setSound(sound);

        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
        }
      } catch (err) {
        console.error("Error loading sound:", err);
      }
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [source]);

  const togglePlayPause = async () => {
    if (!sound) return;

    const status = (await sound.getStatusAsync()) as AVPlaybackStatus;

    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        await sound.playAsync();
        setIsPlaying(true);

        intervalRef.current = setInterval(async () => {
          const currentStatus = (await sound.getStatusAsync()) as AVPlaybackStatus;
          if (currentStatus.isLoaded) {
            setPosition(currentStatus.positionMillis || 0);
          }
        }, 500);
      }
    }
  };

  const onSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={{ padding: 10 }}>
      <Button title={isPlaying ? "Pause" : "Play"} onPress={togglePlayPause} />
      
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onSlidingComplete={onSeek}
      />

      <Text>
        {formatTime(position)} / {formatTime(duration)}
      </Text>
    </View>
  );
};

export default AudioPlayer;
