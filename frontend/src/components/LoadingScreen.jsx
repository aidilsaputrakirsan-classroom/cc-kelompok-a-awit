import Particles from "@tsparticles/react";
import "./LoadingScreen.css";
import palmImg from "../assets/palm.png";

export default function LoadingScreen({ duration = 2500, isFadingOut = false }) {

  const particlesOptions = {
    background: {
      color: {
        value: "#ffffff",
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: "#d6382f", // Palm chain primary red or green
      },
      links: {
        color: "#d6382f",
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 1.5,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 40,
      },
      opacity: {
        value: 0.3,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  };

  return (
    <div className={`loading-screen-overlay ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
      <Particles
        id="tsparticles-loading"
        options={particlesOptions}
        className="loading-particles"
      />
      <div className="loading-content">
        <div className="loading-image-wrapper">
          <img src={palmImg} alt="Palm Logo" className="loading-image" />
          <svg className="loading-progress-ring" width="160" height="160" viewBox="0 0 160 160">
            <circle
              className="loading-progress-ring-track"
              stroke="#e0e0e0"
              strokeWidth="6"
              fill="transparent"
              r="74"
              cx="80"
              cy="80"
            />
            <circle
              className="loading-progress-ring-circle"
              stroke="#d6382f"
              strokeWidth="6"
              strokeLinecap="round"
              fill="transparent"
              r="74"
              cx="80"
              cy="80"
              style={{ animationDuration: `${duration}ms` }}
            />
          </svg>
        </div>
        <div className="loading-text">Memuat...</div>
      </div>
    </div>
  );
}
