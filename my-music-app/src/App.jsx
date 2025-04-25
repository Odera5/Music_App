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
            setError("No playable previews found for this search.");
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
    // You might want to pause other previews here if they were playing
    // This requires managing multiple audio elements, which adds complexity
    // For this example, we just update the visual indicator.
  };

  // Function to handle when an audio preview pauses or ends
  const handlePauseEnd = () => {
    setPlayingTrackId(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Odera Music</h1>
      </header>

      <main>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for a track, artist, or album..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {/* Use status-message class for consistent styling */}
        {loading && <div className="status-message loading-spinner"></div>}
        {error && (
          <p className="status-message error-message">Error: {error}</p>
        )}

        {/* Optional: "Now Playing" display */}
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
                // Add 'playing' class if this track is the one currently playing
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
                    } // Try XL cover, then big, medium
                    alt={`${track.album?.title} cover`}
                    className="album-cover"
                  />
                  <div className="track-info">
                    <h3>{track.title}</h3>
                    <p>
                      {track.artist?.name} - {track.album?.title}
                    </p>
                    {/* Audio player for 30-second preview */}
                    {/* Add event handlers */}
                    <audio
                      controls
                      src={track.preview}
                      onPlay={() => handlePlay(track.id)}
                      onPause={handlePauseEnd}
                      onEnded={handlePauseEnd}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              ))
            : !loading &&
              !error &&
              !searchTerm.trim() && (
                <p className="status-message">Search for some music!</p>
              )}
          {/* Display "No results" if search was performed but no tracks found */}
          {!loading && !error && searchTerm.trim() && tracks.length === 0 && (
            <p className="status-message">
              No results found for "{searchTerm}".
            </p>
          )}
          {/* Display message if results found but none have previews */}
          {!loading &&
            !error &&
            searchTerm.trim() &&
            tracks.length > 0 &&
            tracks.every((track) => !track.preview) && (
              <p className="status-message">
                No playable previews found for this search.
              </p>
            )}
        </div>
      </main>
    </div>
  );
}

export default App;
