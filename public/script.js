const BACKEND_URL = "https://spotifyalbumcoverfetcher.onrender.com";
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
    const res = await fetch(`${BACKEND_URL}/token`, { method: "POST" });
    const tokenData = await res.json();
    const token = tokenData.access_token;

    const albumCoverUrl = await searchAlbumCover(token, `${artistName} ${songTitle}`);

    if (albumCoverUrl) {
      resultMessage.textContent = "Album Cover Found!";
      albumCover.src = albumCoverUrl;
      albumCover.style.display = "block";
      downloadButton.style.display = "inline-block";
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

async function searchAlbumCover(token, query) {
  const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}&type=album&limit=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (data.albums && data.albums.items.length > 0 && data.albums.items[0].images.length > 0) {
    return data.albums.items[0].images[0].url;
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
