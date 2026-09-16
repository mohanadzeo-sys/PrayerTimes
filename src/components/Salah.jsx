import "./Salah.css";
import { useState, useEffect } from "react";
import axios from "axios";

const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

function toDisplayDate(isoDate) {
  const [yyyy, mm, dd] = isoDate.split("-");
  return `${dd}-${mm}-${yyyy}`;
}

function getTodayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Salah() {
  const [location, setLocation] = useState("Cairo");
  const [date, setDate] = useState(getTodayISO());
  const [prayers, setPrayers] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  function getSalahs(isoDate, loc) {
    setIsLoading(true);
    setError(null);

    axios
      .get(
        `https://api.aladhan.com/v1/timingsByAddress/${toDisplayDate(isoDate)}?address=${encodeURIComponent(loc)}`,
      )
      .then((res) => {
        setPrayers(res.data.data.timings);
      })
      .catch((err) => {
        if (err.response) {
          setError(
            err.response.status === 400
              ? "Couldn't find that location. Try a different city."
              : "Something went wrong fetching prayer times.",
          );
        } else if (err.request) {
          setError("Network error — check your connection and try again.");
        } else {
          setError("Something went wrong.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    getSalahs(date, location);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-page">
        <div className="error-mark" />
        <p>{error}</p>
        <button
          className="retry-btn"
          onClick={() => {
            const today = getTodayISO();
            setLocation("Cairo");
            setDate(today);
            getSalahs(today, "Cairo");
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>Prayer Times</h1>
        <div className="controls">
          <label className="field">
            <span>City</span>
            <input
              type="text"
              placeholder="Enter a city"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <button
            className="prayers-btn"
            onClick={() => getSalahs(date, location)}
          >
            Get prayers
          </button>
        </div>
      </header>

      <section className="timeline">
        {PRAYER_KEYS.map((key, i) => (
          <div key={key} className="prayer-row">
            <div className="marker-col">
              <span className="marker" />
              {i < PRAYER_KEYS.length - 1 && <span className="thread" />}
            </div>
            <div className="prayer-content">
              <h2>{key}</h2>
              <p>{prayers?.[key]}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
