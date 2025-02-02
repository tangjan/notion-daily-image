import { Client } from "@notionhq/client";
import getRandomIllustrationId from "./get_random_illustration_id.js";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const NOTION_POSITION_BLOCK_ID = process.env.NOTION_POSITION_BLOCK_ID;
const NOTION_BLOG_PAGE_ID = process.env.NOTION_BLOG_PAGE_ID;

async function updateBlogImage() {
  // 获取博客页面的所有块
  let allBlocks = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.blocks.children.list({
      block_id: NOTION_BLOG_PAGE_ID,
      start_cursor: startCursor,
      page_size: 100,
    });

    allBlocks = [...allBlocks, ...response.results];
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  console.log(
    "获取到的所有块:",
    allBlocks.map((block) => ({
      id: block.id,
      type: block.type,
    }))
  );

  // 找到 POSITION 块的索引
  const positionIndex = allBlocks.findIndex(
    (block) => block.id === NOTION_POSITION_BLOCK_ID
  );

  console.log("POSITION_BLOCK_ID:", NOTION_POSITION_BLOCK_ID);
  console.log("找到的位置:", positionIndex);

  // 删除 POSITION 块后的块
  await notion.blocks.delete({
    block_id: allBlocks[positionIndex + 1].id,
  });

  // 添加新块
  await notion.blocks.children.append({
    block_id: NOTION_BLOG_PAGE_ID,
    after: NOTION_POSITION_BLOCK_ID,
    children: [
      {
        type: "synced_block",
        synced_block: {
          synced_from: {
            block_id: await getRandomIllustrationId(),
          },
        },
      },
    ],
  });
}

// 执行更新
updateBlogImage().catch((error) => {
  console.error("发生错误:", error.message);
});
