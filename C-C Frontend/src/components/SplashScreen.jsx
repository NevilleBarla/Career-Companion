import { useEffect, useRef, useState } from "react";

function SplashScreen({ onDone }) {
  const videoRef = useRef(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      // Start fade-out when video ends
      setFading(true);
      setTimeout(() => onDone(), 600);
    };

    // Safety fallback — if video fails or takes too long
    const fallback = setTimeout(() => {
      setFading(true);
      setTimeout(() => onDone(), 600);
    }, 6000);

    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("ended", handleEnded);
      clearTimeout(fallback);
    };
  }, [onDone]);

  return (
    <>
      <style>{`
        .splash-overlay {
          position: fixed;
          inset: 0;
          background: #0d0d0f;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 1;
          transition: opacity 0.6s ease;
        }
        .splash-overlay.fade-out {
          opacity: 0;
          pointer-events: none;
        }
        .splash-video {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          border-radius: 0;
          animation: splashPop 0.4s ease forwards;
        }
        @keyframes splashPop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className={`splash-overlay ${fading ? "fade-out" : ""}`}>
        <video
          ref={videoRef}
          src="/splash.mp4"
          autoPlay
          muted
          playsInline
          className="splash-video"
        />
      </div>
    </>
  );
}

export default SplashScreen;