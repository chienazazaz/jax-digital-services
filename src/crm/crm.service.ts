import ndjson from "ndjson";
import { pipeline } from "node:stream/promises";

import { createTasks, queryBuilder, load } from "../gcloud";
import { DEFAULT_SCHEMA, transformData } from "../utilities";
import { CONNECTION, TABLES } from "./crm.const";

const getData = async ({
  table,
  updated_from,
  updated_to,
}: {
  table: keyof typeof TABLES;
  updated_from: string;
  updated_to: string;
}) => {
  const data: any = [];
  await queryBuilder(table)
    .connection(CONNECTION)
    .where(TABLES[table].date_field, ">=", updated_from)
    .where(TABLES[table].date_field, "<", updated_to)
    .select("*")
    .then((res) => res.map((r) => data.push(JSON.parse(JSON.stringify(r)))));

  return data;
};

const createSyncTasks = async ({ updated_from,updated_to }: { updated_from: string;
  updated_to: string; }) => {
  const params = Object.keys(TABLES).map((table) => ({ table, updated_from,updated_to }));
  return await createTasks(params, (p) => [p.table].join("-"), "crm/sync");
};

const runPipeline = async ({
  table,
  updated_from,
  updated_to,
}: {
  table: keyof typeof TABLES;
  updated_from: string;
  updated_to: string;
}) => {
  const data = await getData({ table, updated_from, updated_to });
  const stream = transformData(data, TABLES[table].id_field);
  return pipeline(
    stream,
    ndjson.stringify(),
    load("DOTB_CRM", table, DEFAULT_SCHEMA)
  ).then(() => ({ status: "success", rows: data.length, table }));
};

export { createSyncTasks, runPipeline };
