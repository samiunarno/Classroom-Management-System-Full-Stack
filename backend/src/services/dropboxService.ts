import { Dropbox } from "dropbox";
import fetch from "isomorphic-fetch";


const dbx = new Dropbox({
accessToken: process.env.ACCESS_TOKEN || "",
fetch,
});


export const uploadToDropbox = async (file: Express.Multer.File) => {
if (!process.env.ACCESS_TOKEN) {
throw new Error("Dropbox ACCESS_TOKEN is missing.");
}


const uploaded = await dbx.filesUpload({
  path: `/${file.originalname}`,
  contents: file.buffer,
  mode: { ".tag": "overwrite" },   // FIXED ✔
});



const filePath = uploaded.result.path_lower!;
const existingLinks = await dbx.sharingListSharedLinks({ path: filePath });


let sharedUrl = existingLinks.result.links[0]?.url;


if (!sharedUrl) {
const newLink = await dbx.sharingCreateSharedLinkWithSettings({ path: filePath });
sharedUrl = newLink.result.url;
}


const directLink = sharedUrl.replace("dl=0", "raw=1");


return { sharedLink: sharedUrl, directLink };
};