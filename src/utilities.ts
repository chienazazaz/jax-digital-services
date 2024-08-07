import Crypto from "node:crypto";
import { Readable } from "node:stream";

const DEFAULT_SCHEMA = [
  { name: "data", type: "JSON" },
  { name: "_batched_at", type: "TIMESTAMP" },
  { name: "id", type: "string" },
];

const convertToCSV = (data: Record<string, any>[]) => {
  const headers = Object.keys(data[0]).join(",");
  const values = data
    .map((row) => {
      return Object.values(row).join(",");
    })
    .join("\n");
  return headers + "\n" + values;
};

const transformData = (
  data: Record<string, any>[],
  id_field?: string
): Readable => {
  const _batched_at = new Date(Date.now()).toISOString();
  const stream = new Readable({ objectMode: true, read: () => {} });
  data.forEach((row) =>
    stream.push({
      data: row,
      _batched_at,
      id: id_field
        ? row[id_field]
        : Crypto.createHash("sha256").update(JSON.stringify(row)).digest("hex"),
    })
  );
  stream.push(null);
  return stream;
};

export { convertToCSV, transformData, DEFAULT_SCHEMA };
