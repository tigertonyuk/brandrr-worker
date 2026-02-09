import { spawn } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import fetch from "node-fetch";
import { pipeline } from "stream/promises";

export function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio:["ignore","pipe","pipe"] });
    let err="";
    p.stderr.on("data", d => err+=d);
    p.on("close", c => c===0?resolve():reject(new Error(err)));
  });
}
export async function ensureDir(d){ await fs.mkdir(d,{recursive:true}); }
export async function downloadToFile(url, localPath){
  const res = await fetch(url);
  if(!res.ok) throw new Error("Download failed");
  await ensureDir(path.dirname(localPath));
  await pipeline(res.body, fsSync.createWriteStream(localPath));
  return localPath;
}
