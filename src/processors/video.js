import { run } from "../utils.js";
export async function brandVideo({inputPath,logoPath,outputPath}){
  await run("ffmpeg",["-y","-i",inputPath,"-i",logoPath,"-filter_complex","overlay=10:10",outputPath]);
}