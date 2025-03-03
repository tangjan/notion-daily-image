import getRandomImageSource from "./get_random_picture_source.js";
import getRandomImgUrlFromJson from "./get_random_picture_from_json.js";
import replaceNotionPageImage from "../common/replace_image.js";

const NOTION_PROGRAMMING_HUMOR_DATABSE_ID = "1a9ef3884665801cb8bfc90e64e23337";
const NOTES_POSITION_BLOCK_ID = "19eef388-4665-8036-b28e-d2d8c9d36bae";
const NOTION_NOTES_PAGE_ID = "19eef388466580d0b88cedccdc223411";

async function main() {
  const chosenSource = await getRandomImageSource();
  console.log(`选择的数据源: ${chosenSource}`);

  let useImageType = false;
  let imageUrl = "";

  if (chosenSource === "json") {
    useImageType = true;
    imageUrl = await getRandomImgUrlFromJson();
    console.log(`获取到的随机图片URL: ${imageUrl}`);
  }

  await replaceNotionPageImage(
    process.env.NOTION_NOTES_API_KEY,
    NOTES_POSITION_BLOCK_ID,
    NOTION_NOTES_PAGE_ID,
    NOTION_PROGRAMMING_HUMOR_DATABSE_ID,
    useImageType,
    imageUrl
  );
}

main();
