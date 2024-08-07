import { Storage } from "@google-cloud/storage";
import { Readable } from "node:stream";

const client = new Storage();

export const createJson = async (
  bucketName: string,
  filename: string,
  data: {}[]
) => {
  const bucket = client.bucket(bucketName);
  const result = await bucket
    .file(filename)
    .save(JSON.stringify(data), {
      contentType: "application/json",
      onUploadProgress: (progressEvent: any) => {
        console.log(progressEvent);
      },
    })
    .then(() => `uploaded ${data.length}`)
    .catch((err) => err);

  return { response: result };
};

export const fetchJson = async (bucketName: string, fileName: string) => {
  const bucket = client.bucket(bucketName);
  const stream = bucket.file(fileName).createReadStream();
  return streamToString(stream);
};

const streamToString = (stream: Readable) => {
  const chunks: any[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    // stream.on('error', (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString()));
  }).then((res) => res);
};
