import { useEffect, useState } from "react";

export default function PomodoroTimer() {
  const TOTAL = 25 * 60; // 25 minutes

  const [time, setTime] = useState(TOTAL);
  const [isRunning, setIsRunning] = useState(false);

  // countdown
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          alert("Time's up! ⏰");
          return TOTAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // format time
  const format = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // circle progress
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = ((TOTAL - time) / TOTAL) * circumference;

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: "20px" }}>Pomodoro Timer</h2>

      <div style={styles.circleWrapper}>
        <svg width="220" height="220">
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="#ddd"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="#8b5cf6"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
          />
        </svg>

        <div style={styles.time}>{format(time)}</div>
      </div>

      <div style={styles.buttons}>
        <button onClick={() => setIsRunning(true)}>Start</button>
        <button onClick={() => setIsRunning(false)}>Pause</button>
        <button
          onClick={() => {
            setIsRunning(false);
            setTime(TOTAL);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    background: "#1e1b4b",
    color: "white",
    padding: "30px",
    borderRadius: "20px",
    width: "300px",
    margin: "auto",
  },
  circleWrapper: {
    position: "relative",
    width: "220px",
    height: "220px",
    margin: "auto",
  },
  time: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "28px",
    fontWeight: "bold",
  },
  buttons: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-around",
  },
};