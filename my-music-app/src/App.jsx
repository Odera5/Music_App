import React, { useState } from "react";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playingTrackId, setPlayingTrackId] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setTracks([]);
    setPlayingTrackId(null);

    if (!searchTerm.trim()) {
      setError("Please enter a search term.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://corsproxy.io/?https://api.deezer.com/search?q=${encodeURIComponent(
          searchTerm
        )}&limit=25`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.data) {
        setTracks(data.data.filter((track) => track.preview));
        if (data.data.filter((track) => track.preview).length === 0) {
          if (data.data.length > 0) {
            setError("No preview found for this search.");
          } else {
            setTracks([]);
          }
        }
      } else {
        setTracks([]);
      }
    } catch (e) {
      console.error("Error fetching data from Deezer API:", e);
      setError("Failed to fetch music data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (trackId) => {
    setPlayingTrackId(trackId);
  };

  const handlePauseEnd = () => {
    setPlayingTrackId(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Odera Music App</h1>
      </header>

      <main>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {playingTrackId && tracks.length > 0 && (
          <div className="now-playing">
            Now Playing Preview:{" "}
            {tracks.find((t) => t.id === playingTrackId)?.title} by{" "}
            {tracks.find((t) => t.id === playingTrackId)?.artist?.name}
          </div>
        )}

        <div className="track-list">
          {tracks.length > 0
            ? tracks.map((track) => (
                <div
                  key={track.id}
                  className={`track-item ${
                    playingTrackId === track.id ? "playing" : ""
                  }`}
                >
                  <img
                    src={
                      track.album?.cover_xl ||
                      track.album?.cover_big ||
                      track.album?.cover_medium ||
                      "placeholder.png"
                    }
                    alt={`${track.album?.title} cover`}
                    className="album-cover"
                  />
                  <div className="track-info">
                    <h3>{track.title}</h3>
                    <p>
                      {track.artist?.name} - {track.album?.title}
                    </p>

                    <audio
                      controls
                      src={track.preview}
                      onPlay={() => handlePlay(track.id)}
                      onPause={handlePauseEnd}
                      onEnded={handlePauseEnd}
                    ></audio>
                  </div>
                </div>
              ))
            : !loading &&
              !error &&
              !searchTerm.trim() && <p className="status-message"></p>}
          {!loading && !error && searchTerm.trim() && tracks.length === 0 && (
            <p className="status-message"></p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
