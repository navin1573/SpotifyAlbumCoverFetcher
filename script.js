const CLIENT_ID = "b2568a4f91ff497aa8a97de9d5f9dc4a"; // Replace with your Spotify Client ID
const CLIENT_SECRET = "a2cdee8f35b14d558c43b6592b3e9192"; // Replace with your Spotify Client Secret
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const SEARCH_URL = "https://api.spotify.com/v1/search";

document.getElementById("fetchButton").addEventListener("click", async () => {
  const artistName = document.getElementById("artistName").value.trim();
  const songTitle = document.getElementById("songTitle").value.trim();
  const resultMessage = document.getElementById("resultMessage");
  const albumCover = document.getElementById("albumCover");
  const downloadButton = document.getElementById("downloadButton");

  if (!artistName || !songTitle) {
    resultMessage.textContent = "Please enter both artist name and song title.";
    return;
  }

  try {
    // Get Spotify access token
    const token = await getSpotifyAccessToken();

    // Search for the album cover
    const albumCoverUrl = await searchAlbumCover(token, `${artistName} ${songTitle}`);

    if (albumCoverUrl) {
      resultMessage.textContent = "Album Cover Found!";
      albumCover.src = albumCoverUrl;
      albumCover.style.display = "block";
      downloadButton.style.display = "inline-block";

      // Handle download
      downloadButton.onclick = () => downloadImage(albumCoverUrl, artistName, songTitle);
    } else {
      resultMessage.textContent = "Album cover not found.";
      albumCover.style.display = "none";
      downloadButton.style.display = "none";
    }
  } catch (error) {
    console.error(error);
    resultMessage.textContent = "Error fetching album cover.";
  }
});

async function getSpotifyAccessToken() {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
  });
  const data = await response.json();
  return data.access_token;
}

async function searchAlbumCover(token, query) {
  const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}&type=album&limit=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (data.albums && data.albums.items.length > 0 && data.albums.items[0].images.length > 0) {
    return data.albums.items[0].images[0].url; // Return the cover image URL
  }
  return null;
}

function downloadImage(imageUrl, artistName, songTitle) {
  const sanitizedArtist = artistName.replace(/[^a-zA-Z0-9]/g, "_");
  const sanitizedSong = songTitle.replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `${sanitizedArtist}_${sanitizedSong}.jpg`;

  fetch(imageUrl)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    })
    .catch((error) => console.error("Error downloading image:", error));
}
