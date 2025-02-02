import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// 获取数据库中未使用过的插画页面
async function getUnusedPages() {
  let allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  // 先获取所有页面
  let totalPages = 0;
  let usedPages = 0;

  // 获取所有页面
  let tempHasMore = true;
  let tempCursor = undefined;
  while (tempHasMore) {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_ILLUSTRATION_DATABASE_ID,
      start_cursor: tempCursor,
      page_size: 100,
    });
    totalPages += response.results.length;
    usedPages += response.results.filter(
      (page) => page.properties.已选过?.checkbox
    ).length;
    tempHasMore = response.has_more;
    tempCursor = response.next_cursor;
  }

  // 获取未使用的页面
  while (hasMore) {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_ILLUSTRATION_DATABASE_ID,
      filter: {
        property: "已选过",
        checkbox: {
          equals: false,
        },
      },
      start_cursor: startCursor,
      page_size: 100,
    });

    allPages = [...allPages, ...response.results];
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  // 如果没有未使用的插图，重置所有插图的状态的 checkbox 属性
  if (allPages.length === 0) {
    console.log("所有插图都已使用过，重置状态...");
    await resetAllIllustrations();
    return getUnusedPages();
  }

  console.log(
    `可用插图数量: ${allPages.length}，已选择数量: ${usedPages}，总数量: ${totalPages}`
  );
  return allPages;
}

// 重置所有插图的 checkbox 属性
async function resetAllIllustrations() {
  let allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_ILLUSTRATION_DATABASE_ID,
      start_cursor: startCursor,
      page_size: 100,
    });

    allPages = [...allPages, ...response.results];
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  for (const page of allPages) {
    await notion.pages.update({
      page_id: page.id,
      properties: {
        已选过: {
          checkbox: false,
        },
      },
    });
  }
}

async function getRandomIllustrationId() {
  try {
    const availablePages = await getUnusedPages();

    // 随机选择一个页面
    const randomIndex = Math.floor(Math.random() * availablePages.length);
    const randomPage = availablePages[randomIndex];
    console.log("随机选中的页面:", randomPage.url);

    // 标记为已使用
    await notion.pages.update({
      page_id: randomPage.id,
      properties: {
        已选过: {
          checkbox: true,
        },
      },
    });

    // 获取第一个图片块ID
    const blocks = await notion.blocks.children.list({
      block_id: randomPage.id,
    });
    const firstBlock = blocks.results[0];

    return firstBlock.id;
  } catch (error) {
    console.error("获取随机插图ID失败:", error);
    throw error;
  }
}

export default getRandomIllustrationId;
