import replaceNotionPageImage from "../common/replace_image.js";

const NOTION_YOUZITSU_PAGE_ID = "1a1ef3884665804ca1b5fa27ab896693";
const NOTION_YOUZITSU_POSITION_BLOCK_ID = "1a2ef388-4665-8094-b297-dc4d480ca920";
const NOTION_YOUZITSU_ILLUSTRATION_DATABASE_ID = "10eef3884665808f953fe10c90a2b913";

replaceNotionPageImage(
  process.env.NOTION_YOUZITSU_API_KEY,
  NOTION_YOUZITSU_POSITION_BLOCK_ID,
  NOTION_YOUZITSU_PAGE_ID,
  NOTION_YOUZITSU_ILLUSTRATION_DATABASE_ID,
  false,
  ""
);
