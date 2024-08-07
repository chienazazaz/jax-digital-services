import ndjson from "ndjson";
import { pipeline } from "node:stream/promises";

import { createTasks, queryBuilder, load } from "../gcloud";
import { DEFAULT_SCHEMA, transformData } from "../utilities";
import { CONNECTION, TABLES } from "./crm.const";

const getData = async ({
  table,
  updated,
}: {
  table: keyof typeof TABLES;
  updated: string;
}) => {
  const data: any = [];
  await queryBuilder(table)
    .connection(CONNECTION)
    .where(TABLES[table].date_field, ">=", updated)
    .select("*")
    .then((res) => res.map((r) => data.push(JSON.parse(JSON.stringify(r)))));

  return data;
};

const createSyncTasks = async ({ date }: { date: string }) => {
  const params = Object.keys(TABLES).map((table) => ({ table, updated: date }));
  return await createTasks(params, (p) => [p.table].join("-"), "crm/sync");
};

const runPipeline = async ({
  table,
  updated,
}: {
  table: keyof typeof TABLES;
  updated: string;
}) => {
  const data = await getData({ table, updated });
  const stream = transformData(data, TABLES[table].id_field);
  return pipeline(
    stream,
    ndjson.stringify(),
    load("DOTB_CRM", table, DEFAULT_SCHEMA)
  ).then(() => ({ status: "success", rows: data.length, table }));
};

export { createSyncTasks, runPipeline };
