// src/services/dropboxService.ts
import { Dropbox } from "dropbox";
import fetch from "isomorphic-fetch";

const dbx = new Dropbox({
  accessToken: process.env.ACCESS_TOKEN!,
  fetch,
});

export const uploadToDropbox = async (file: Express.Multer.File) => {
  const uploaded = await dbx.filesUpload({
    path: "/" + file.originalname,
    contents: file.buffer,
    mode: "overwrite",
  });

  const filePath = uploaded.result.path_lower;

  // Check if shared link exists
  const existingLinks = await dbx.sharingListSharedLinks({ path: filePath });

  let sharedUrl: string;

  if (existingLinks.result.links.length > 0) {
    sharedUrl = existingLinks.result.links[0].url;
  } else {
    const newLink = await dbx.sharingCreateSharedLinkWithSettings({
      path: filePath,
    });
    sharedUrl = newLink.result.url;
  }

  const directLink = sharedUrl.replace("dl=0", "raw=1");

  return {
    sharedLink: sharedUrl,
    directLink,
  };
};
