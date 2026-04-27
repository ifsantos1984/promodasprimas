import { useState, useRef, useEffect } from "react";
import { Music, Pause, Play } from "lucide-react";
import { Button } from "./ui/button";

// Música Lo-Fi sem direitos autorais para background
const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Volume baixo e suave

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error("Erro ao tocar áudio:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        variant="outline"
        size="icon"
        className={`h-12 w-12 rounded-full shadow-lg transition-all duration-300 ${
          isPlaying ? "border-primary bg-primary/10 text-primary animate-pulse" : "bg-background text-muted-foreground"
        }`}
        onClick={togglePlay}
        title={isPlaying ? "Pausar música" : "Tocar música"}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Music className="h-5 w-5" />}
      </Button>
    </div>
  );
}
