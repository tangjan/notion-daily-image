import { Client } from "@notionhq/client";

export async function getUnusedPages(notionApiKey, databaseId) {
  const notion = new Client({ auth: notionApiKey });
  let availablePages = [];
  let hasMore = true;
  let startCursor = undefined;

  let totalPages = 0;
  let usedPages = 0;

  let tempHasMore = true;
  let tempCursor = undefined;
  while (tempHasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
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

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "已选过",
        checkbox: {
          equals: false,
        },
      },
      start_cursor: startCursor,
      page_size: 100,
    });

    availablePages = [...availablePages, ...response.results];
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  if (availablePages.length === 0) {
    console.log("所有插图都已使用过，重置状态...");
    await resetAllIllustrations(notionApiKey, databaseId);
  }

  console.log(
    `Notion 数据库可用插图数量: ${availablePages.length}，已选择数量: ${usedPages}，总数量: ${totalPages}`
  );
  return { availablePages, totalPages };
}

// 如果所有图片都已选过，重置所有页面的 checkbox 属性
async function resetAllIllustrations(notionApiKey, databaseId) {
  const notion = new Client({ auth: notionApiKey });
  let allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
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

export async function getRandomIllustrationId(notionApiKey, databaseId) {
  try {
    const notion = new Client({ auth: notionApiKey });
    const { availablePages, totalPages } = await getUnusedPages(
      notionApiKey,
      databaseId
    );

    const randomIndex = Math.floor(Math.random() * availablePages.length);
    const randomPage = availablePages[randomIndex];
    console.log("随机选中的页面:", randomPage.url);

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
