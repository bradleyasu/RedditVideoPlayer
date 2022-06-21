// @ts-ignore
import React, { createRef, useEffect, useState } from "react";
import "./Player.css";

interface IPlayerProps {
  width?: string;
  height?: string;
  url: string;
  audioUrl: string | undefined;
}

const playSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path d="M2 24v-24l20 12-20 12z" />
  </svg>
);
const pauseSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path d="M10 24h-6v-24h6v24zm10-24h-6v24h6v-24z" />
  </svg>
);

const Player = ({
  width = "400px",
  height = "300px",
  url,
  audioUrl
}: IPlayerProps) => {
  const [hovering, setHovering] = useState<boolean>(false);
  const [time, setTime] = useState<any>("00:00:00");
  const [duration, setDuration] = useState<any>(0);
  const [progress, setProgress] = useState<number>(0);
  const [ref, setRef] = useState<any>(null);
  const [audioRef, setAudioRef] = useState<any>(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const [audioReady, setAudioReady] = useState<boolean>(audioUrl === undefined);
  const [videoReady, setVideoReady] = useState<boolean>(false);

  const [audioError, setAudioError] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  const _setPlaying = (play) => {
    setPlaying(play);
    if (play) ref.current.play();
    else ref.current.pause();
    if (audioUrl) {
      if (play) audioRef.current.play();
      else audioRef.current.pause();
    }
  };

  useEffect(() => {
    setRef(createRef<HTMLVideoElement>());
    setAudioRef(createRef<HTMLAudioElement>());
  }, []);

  useEffect(() => {
    if (
      ref == null ||
      ref.current == null ||
      (audioUrl !== undefined && (audioRef == null || audioRef.current == null))
    )
      return;
    ref.current.load();
    audioRef.current.load();
    document.addEventListener("keyup", (e: any) => {
      if (e.code === "Space" && ref.current) {
        _setPlaying(ref.current.paused);
      }
    });
    ref.current.addEventListener("timeupdate", () => {
      if (ref.current == null) return;
      setTime(
        new Date(ref.current.currentTime * 1000).toISOString().substr(11, 8)
      );
      const percent = (ref.current.currentTime / ref.current.duration) * 100.0;
      setProgress(percent);
      //if (playing && audioRef.current.paused) audioRef.current.play();
    });

    ref.current.addEventListener("canplay", () => {
      if (ref.current == null) return;
      const percent = (ref.current.currentTime / ref.current.duration) * 100.0;
      setProgress(percent);
      setVideoReady(true);
      setDuration(ref.current.duration);
    });

    audioRef.current.addEventListener("canplay", () => {
      if (audioRef.current == null) return;
      setAudioReady(true);
    });

    audioRef.current.addEventListener("abort", function failed(e: Error) {
      setAudioReady(true);
    });

    ref.current.addEventListener("error", () => {
      setVideoReady(true);
    });

    ref.current.addEventListener("ended", () => {
      setProgress(0);
      setPlaying(false);
    });
  }, [ref, audioRef]);

  return (
    <div
      className={"root"}
      style={{ width: width, height: height }}
      onMouseOver={() => {
        setHovering(true);
      }}
      onMouseOut={() => {
        setHovering(false);
      }}
      onClick={() => _setPlaying(ref.current.paused)}
      //onClick={() => setHovering(!hovering)}
    >
      {(!audioReady || !videoReady) && (
        <div className={"loading"}>
          {`Loading video...${videoReady ? "[done]" : ""}`}
          <br />
          {`Loading audio...${audioReady ? "[done]" : ""}`}
        </div>
      )}
      <div className="errors">
        {audioError && <div>Audio Error</div>}
        {videoError && <div>Video Error</div>}
      </div>
      <div className="logo">jusplay</div>
      <video controls={false} ref={ref}>
        <source src={url} type="video/mp4" />
      </video>
      <div
        className={`controls controls-${hovering ? "open" : "closed"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={"playPause"}
          onClick={() => {
            _setPlaying(ref.current.paused);
          }}
        >
          {playing ? pauseSvg : playSvg}
        </div>
        <div
          className={"track"}
          onClick={(e) => {
            const pos = e.currentTarget.getBoundingClientRect();
            const width = pos.width;
            const x = e.clientX - pos.x;
            const seekTo = (x * duration) / width;
            ref.current.currentTime = seekTo;
            audioRef.current.currentTime = seekTo;
          }}
        >
          <div className={"progress"} style={{ width: `${progress}%` }} />
        </div>
        <div className={"time"}>{time}</div>
      </div>
      <audio controls={false} ref={audioRef}>
        <source src={audioUrl} type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default Player;
