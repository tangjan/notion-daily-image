import replaceNotionPageImage from "../common/replace_image.js";

const NOTION_BLOG_PAGE_ID = "05091d263a514c638f1ec56e40e0a4ac";
const NOTION_BLOG_POSITION_BLOCK_ID = "189ef388-4665-80c8-b879-c3b7495e0f6e";
const NOTION_ILLUSTRATION_DATABASE_ID = "18bef388466580ff9778eddd28e9e472";

replaceNotionPageImage(
  process.env.NOTION_BLOG_API_KEY,
  NOTION_BLOG_POSITION_BLOCK_ID,
  NOTION_BLOG_PAGE_ID,
  NOTION_ILLUSTRATION_DATABASE_ID,
  false,
  ""
);
