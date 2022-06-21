import "./styles.css";
import Player from "./Player/Player.tsx";
import { useEffect, useState } from "react";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const u = params.get("u");

  const [video, setVideo] = useState(null);
  const [audio, setAudio] = useState(null);
  const [message, setMessage] = useState("Loading...");

  const f = async () => {
    const json = await fetch(`${u}.json`).then((res) => res.json());
    const v = json[0].data.children[0].data.media?.reddit_video.fallback_url;
    if (!v) {
      setMessage("Could not load media");
      return;
    }
    const a = v
      .replace("720.mp4", "audio.mp4")
      .replace("480.mp4", "audio.mp4")
      .replace("1080.mp4", "audio.mp4")
      .replace("240.mp4", "audio.mp4");
    setVideo(v);
    setAudio(a);
  };

  useEffect(() => {
    !!u && f();
  }, []);

  const renderBookmark = () => {
    const test = `
    javascript: (function () {
      let posts = Array.from(
        document.querySelectorAll('[data-click-id="comments"]')
      );
      posts.forEach((post) => {
          let href = post.getAttribute("href");
          let url = "https://jusplay.com?u=https://reddit.com" + href;
          let btn = document.createElement("div");
          btn.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            window.open(url);
          };
          btn.innerHTML = "jusplay it";
          post.parentNode.parentNode.append(btn);
          post.setAttribute("data-click-id", "comments_processed");
        });
      })();
    `;
    return (
      <div>
        Reddit's video player sucks ass.
        <br />
        Save this bookmark to add a "jusplay it" link to reddit posts.
        <br />
        "jusplay it" will play the video in a standard HTML5 player.
        <pre style={{ textAlign: "left" }}>{test}</pre>
        <sup>
          I hacked this together in an afternoon. Why can't reddit's engineers
          make a player that doesn't make videos look like they were filmed with
          a potato?????
        </sup>
      </div>
    );
  };

  return (
    <div className="App">
      {(!!u && video !== null && audio !== null && (
        <Player url={video} audioUrl={audio} width="100vw" height="100vh" />
      )) ||
        (!!!u && renderBookmark()) ||
        message}
    </div>
  );
}
