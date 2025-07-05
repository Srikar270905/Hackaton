import React, { useState } from "react";
import axios from "axios";
import CityCard from "./components/CityCard";
import Loader from "./components/Loader";
import Map from "./components/Map";
import VoiceAssistant from "./components/VoiceAssistant";
import TextToSpeech from "./components/TextToSpeech";
import { translateText } from "./utils/translate";

function App() {
  const [city, setCity] = useState("");
  const [info, setInfo] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState("");
  const [translated, setTranslated] = useState("");

  const toggleDark = () => setDarkMode(!darkMode);

  const fetchCity = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setInfo(null);
    setCoordinates(null);
    setTranslated("");

    try {
      const wikiRes = await axios.get(`http://localhost:5001/api/wiki/${city}`);
      setInfo(wikiRes.data);
    } catch (err) {
      setError("City not found or Wikipedia API error");
      setLoading(false);
      return;
    }

    try {
      const coordRes = await axios.get(`http://localhost:5001/api/coordinates/${city}`);
      setCoordinates(coordRes.data); // { lat, lng }
    } catch (err) {
      console.warn("Coordinates not found");
      setCoordinates(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (spokenText) => {
    setCity(spokenText);
    setTimeout(() => fetchCity(), 500);
  };

  const handleTranslate = async () => {
    if (info?.extract) {
      const translatedText = await translateText(info.extract, "hi");
      setTranslated(translatedText);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen p-6 transition-colors duration-500 dark:bg-gray-900 dark:text-white">
        <header className="flex items-center justify-between max-w-3xl mx-auto">
          <h1 className="text-4xl font-semibold">ReLive</h1>
          <button
            onClick={toggleDark}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg transition"
          >
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </header>

        <div className="flex flex-col md:flex-row items-center gap-4 mt-10 max-w-3xl mx-auto">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name (e.g. London)"
            className="flex-grow px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            onClick={fetchCity}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition"
          >
            🔍 Search
          </button>
          <VoiceAssistant onResult={handleVoiceResult} />
        </div>

        {loading && <Loader />}

        {error && (
          <p className="text-red-600 mt-6 text-center max-w-3xl mx-auto">{error}</p>
        )}

        {info && (
          <div className="max-w-3xl mx-auto mt-6">
            <CityCard data={info} />
            <TextToSpeech text={info.extract} />
            <button
              onClick={handleTranslate}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Translate to Hindi
            </button>
            {translated && (
              <p className="mt-2 text-green-400 font-medium">{translated}</p>
            )}
          </div>
        )}

        {coordinates && (
          <div className="max-w-5xl mx-auto mt-8">
            <Map lat={coordinates.lat} lng={coordinates.lng} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
