const fs = require("fs");

function readTweeFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractPassages(tweeData) {
  return tweeData.split("\n:: ");
}

function extractTags(lines) {
  const tagsLine = lines.find((line) => line.startsWith("tags:"));
  return tagsLine ? tagsLine.replace("tags:", "").trim().split(",") : [];
}

function getTitleWithTags(title, tags) {
  return { title, tags };
}

function extractLinks(content) {
  const linkRegex = /\[\[(.+?)\]\]/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(content))) {
    links.push(match[1]);
  }
  return links;
}

function removePositionAndSizeFromTitle(title) {
  return title.replace(/ \{.*\}/, "");
}

function extractStoryData(passages) {
  const storyData = {
    passages: {},
    connections: {},
    start: null,
  };

  passages.forEach((passage) => {
    const lines = passage.split("\n");
    const title = lines[0].trim();
    const content = lines.slice(1).join("\n").trim();

    if (title === "StoryData") {
      const storyDataJSON = JSON.parse(content);
      storyData.start = storyDataJSON.start;
      return;
    }

    const tags = extractTags(lines);
    const fromPassage = getTitleWithTags(title, tags);
    const links = extractLinks(content);

    const cleanedTitle = removePositionAndSizeFromTitle(title);

    if (!storyData.passages[cleanedTitle]) {
      storyData.passages[cleanedTitle] = {
        content: "",
        tags,
        links: [],
      };
    }

    links.forEach((link) => {
      const toPassage = getTitleWithTags(link, tags);
      const cleanedLink = removePositionAndSizeFromTitle(link);

      if (!storyData.passages[cleanedLink]) {
        storyData.passages[cleanedLink] = {
          content: "",
          tags: [],
          links: [],
        };
      }
      storyData.passages[cleanedTitle].links.push(toPassage);
    });
  });

  return storyData;
}

function buildNode(passageTitle, storyData) {
  // TODO: point to the right node if it has the -> symbol

  const passage = storyData.passages[passageTitle];
  const node = {
    title: passageTitle,
    content: passage.content || "",
    tags: passage.tags,
    children: [],
  };

  passage.links.forEach((link) => {
    const childNode = buildNode(link.title, storyData);
    node.children.push(childNode);
  });

  return node;
}

function buildTreeStructure(storyData) {
  const rootPassage = storyData.start;
  return buildNode(rootPassage, storyData);
}

function saveTreeStructureAsJSON(treeStructure, outputFilePath) {
  const jsonData = JSON.stringify(treeStructure, null, 2);
  fs.writeFileSync(outputFilePath, jsonData);
}

const tweeFilePath = "./Twee/Tomer Norman.twee";
const tweeData = readTweeFile(tweeFilePath);
const passages = extractPassages(tweeData);
const storyData = extractStoryData(passages);
const treeStructure = buildTreeStructure(storyData);
const outputFilePath = "./JSON/Tomer Norman.json";
saveTreeStructureAsJSON(treeStructure, outputFilePath);
