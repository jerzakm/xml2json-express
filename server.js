import express, { response } from "express";
import Https from "https";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
import "dotenv/config";

const app = express();
const port = process.env.PORT;

app.get("/xml2json/:url", async (req, res) => {
  const { url } = req.params;

  const json = await downloadTextFile(url);
  const builder = new XMLBuilder();
  const xmlContent = builder.build(JSON.parse(json));

  const filename = encodeURI(url);

  res.writeHead(200, {
    "Content-Disposition": `attachment; filename="${filename}.js"`,
    "Content-Type": "text/plain",
  });

  const download = Buffer.from(xmlContent);

  res.end(download);
});

app.get("/json2xml/:url", async (req, res) => {
  const { url } = req.params;

  const xml = await downloadTextFile(url);

  const parser = new XMLParser();
  const json = parser.parse(xml);

  const filename = encodeURI(url);

  res.writeHead(200, {
    "Content-Disposition": `attachment; filename="${filename}.xml"`,
    "Content-Type": "text/xml",
  });

  const download = Buffer.from(json);

  res.end(download);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

async function downloadTextFile(url) {
  return new Promise((resolve, reject) => {
    Https.get(url, (res) => {
      const data = [];
      res
        .on("data", (chunk) => {
          data.push(chunk);
        })
        .on("end", () => {
          let buffer = Buffer.concat(data);
          const text = buffer.toString();
          resolve(text);
        });
    }).on("error", (err) => {
      console.log("download error:", err);

      reject(err);
    });
  });
}
