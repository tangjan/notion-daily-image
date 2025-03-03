import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GIST_JSON_URL =
  "https://gist.githubusercontent.com/tangjan/ceb852425be20b772ee2625d9b5ee606/raw/9a0e20bac4f805cdd72336fde13553b1a9d93e51/Anime-Girls-Holding-Programming-Books-710px-width.json";
const SELECTED_JSON = path.join(__dirname, "json_selected.json");

function ensureSelectedJsonExists() {
  if (!fs.existsSync(SELECTED_JSON)) {
    fs.writeFileSync(SELECTED_JSON, "[]");
    console.log(`Created new json_selected.json file at ${SELECTED_JSON}`);
  }
}

async function getRandomImgUrlFromJson() {
  try {
    ensureSelectedJsonExists();

    const response = await fetch(GIST_JSON_URL);
    const data = await response.json();

    let selectedImages = readSelectedJson();
    let images = data.images;

    let remainingImages = images.filter(
      (entry) => !selectedImages.some((e) => e.image === entry)
    );

    if (remainingImages.length === 0) {
      selectedImages = [];
      remainingImages = images;
    }

    const randomIndex = Math.floor(Math.random() * remainingImages.length);
    const selectedImageUrl = remainingImages[randomIndex];

    const today = new Date();
    today.setHours(today.getHours() + 8); // UTC+8
    const formattedDate = today.toISOString().split("T")[0];

    selectedImages.unshift({ date: formattedDate, image: selectedImageUrl });
    saveSelectedImages(selectedImages);

    console.log(
      "Selected Image URL:",
      selectedImageUrl,
      "Date (UTC+8):",
      formattedDate
    );

    return selectedImageUrl;
  } catch (error) {
    console.error("Error fetching or processing JSON:", error);
    return null;
  }
}

function readSelectedJson() {
  ensureSelectedJsonExists();

  try {
    const data = fs.readFileSync(SELECTED_JSON, "utf8");
    return JSON.parse(data).selected || [];
  } catch (error) {
    console.error("Error reading selected JSON:", error);
    return [];
  }
}

function saveSelectedImages(selectedImages) {
  try {
    const dir = path.dirname(SELECTED_JSON);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(
      SELECTED_JSON,
      JSON.stringify({ selected: selectedImages }, null, 2)
    );
    console.log(
      `Saved ${selectedImages.length} selected images to ${SELECTED_JSON}`
    );
  } catch (error) {
    console.error("Error saving selected images:", error);
  }
}

export default getRandomImgUrlFromJson;
