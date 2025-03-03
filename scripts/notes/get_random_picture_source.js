// 获取随机图片源 1.Notion 2.JSON

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { getUnusedPages } from "../common/get_random_image_from_notion_database.js";

const JSON_URL =
  "https://gist.githubusercontent.com/tangjan/ceb852425be20b772ee2625d9b5ee606/raw/9a0e20bac4f805cdd72336fde13553b1a9d93e51/Anime-Girls-Holding-Programming-Books-710px-width.json";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SELECTED_JSON_PATH = path.join(__dirname, "json_selected.json");

function ensureJsonSelectedFileExists() {
  if (!fs.existsSync(SELECTED_JSON_PATH)) {
    fs.writeFileSync(SELECTED_JSON_PATH, "[]");
    console.log(`Created new json_selected.json file at ${SELECTED_JSON_PATH}`);
  }
}

async function getJsonUnusedCount() {
  ensureJsonSelectedFileExists();

  const response = await fetch(JSON_URL);
  const jsonData = await response.json();
  const jsonTotalCount = jsonData.count;

  let selectedImages = [];
  if (fs.existsSync(SELECTED_JSON_PATH)) {
    selectedImages = JSON.parse(fs.readFileSync(SELECTED_JSON_PATH, "utf8"));
    selectedImages = selectedImages.map((entry) => entry.image);
  }
  const jsonUnusedCount = jsonTotalCount - selectedImages.length;
  console.log(`📊 GITST JSON 未使用数量: ${jsonUnusedCount}`);
  return { jsonUnusedCount, jsonTotalCount };
}

async function getRandomSource(notionApiKey, databaseId) {
  const { availablePages, totalPages } = await getUnusedPages(
    process.env.NOTION_NOTES_API_KEY,
    "1a9ef3884665801cb8bfc90e64e23337"
  );
  console.log(`📊 Notion 未使用页面数量: ${availablePages.length}`);
  const { jsonUnusedCount } = await getJsonUnusedCount();

  const totalUnused = jsonUnusedCount + availablePages.length;

  const chosenSource =
    Math.random() * totalUnused < jsonUnusedCount ? "json" : "notion";
  console.log(`🎲 选择的数据源: ${chosenSource}`);
  return chosenSource;
}

export default getRandomSource;
