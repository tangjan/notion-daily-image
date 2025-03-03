import { Client } from "@notionhq/client";
import { getRandomIllustrationId } from "./get_random_image_from_notion_database.js";

async function replaceNotionPageImage(
  notionApiKey,
  positionBlockId,
  pageId,
  databaseId,
  useImageType = false,
  selectedImageUrl = ""
) {
  const notion = new Client({ auth: notionApiKey });

  let allBlocks = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.blocks.children.list({
      block_id: pageId,
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

  const positionIndex = allBlocks.findIndex(
    (block) => block.id === positionBlockId
  );

  console.log("POSITION_BLOCK_ID:", positionBlockId);
  console.log("找到的位置:", positionIndex);

  if (positionIndex === -1) {
    console.error("未找到指定的位置块。");
    return;
  }

  if (positionIndex + 1 < allBlocks.length) {
    await notion.blocks.delete({
      block_id: allBlocks[positionIndex + 1].id,
    });
  }

  let newBlock;
  if (useImageType) {
    newBlock = {
      type: "image",
      image: {
        type: "external",
        external: {
          url: selectedImageUrl,
        },
      },
    };
  } else {
    newBlock = {
      type: "synced_block",
      synced_block: {
        synced_from: {
          block_id: await getRandomIllustrationId(notionApiKey, databaseId),
        },
      },
    };
  }

  await notion.blocks.children.append({
    block_id: pageId,
    after: positionBlockId,
    children: [newBlock],
  });
}

export default replaceNotionPageImage;
