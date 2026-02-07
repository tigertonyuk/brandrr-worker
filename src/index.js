import express from "express"; import path from "path"; import os from "os"; import fs from "fs/promises";
import { requireWorkerAuth } from "./auth.js"; import { ensureDir, downloadToFile } from "./utils.js";
import { brandVideo } from "./process/video.js"; import { brandPdf } from "./process/pdf.js"; import { brandImage } from "./process/image.js";
import { postJobUpdate } from "./callback.js";

const app=express(); app.use(express.json({limit:"2mb"}));
app.get("/v1/health",(_,r)=>r.json({ok:true}));

app.post("/v1/jobs/start", requireWorkerAuth, async (req,res)=>{
  const { job_id, job_type, inputs, brand, output, callback } = req.body;
  processJob(job_id, job_type, inputs, brand, output, callback).catch(()=>{});
  res.json({accepted:true});
});

async function processJob(job_id, job_type, inputs, brand, output, callback){
  const tmp=path.join(os.tmpdir(),job_id); await ensureDir(tmp);
  const logo=path.join(tmp,"logo.png"); await downloadToFile(brand.logo_url_temp,logo);
  for(const i of inputs){
    const inp=path.join(tmp,i.filename); await downloadToFile(i.temp_url,inp);
    const out=path.join(tmp,"out-"+i.filename);
    if(job_type==="video_brand") await brandVideo({inputPath:inp,logoPath:logo,outputPath:out});
    if(job_type==="pdf_brand") await brandPdf({inputPath:inp,logoPath:logo,outputPath:out});
    if(job_type==="image_brand") await brandImage({inputPath:inp,logoPath:logo,outputPath:out});
  }
  await postJobUpdate({callbackUrl:callback.url,internalKey:process.env.BRANDRR_INTERNAL_KEY,body:{job_id,status:"succeeded"}});
}

app.listen(process.env.PORT||10000);
