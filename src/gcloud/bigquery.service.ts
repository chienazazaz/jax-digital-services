import { adapt, managedwriter } from "@google-cloud/bigquery-storage";
import { BigQuery } from "@google-cloud/bigquery";

const client = new BigQuery();

type CreateLoadStreamOptions = {
  table: string;
  schema: Record<string, any>[];
  dataset: string;
};

export const getRows = async <T>(query: string) => {
  const [job] = await client.createQueryJob(query);
  const [rows] = await job.getQueryResults();
  return rows;
};

export const load = (
  dataset: string,
  table: string,
  schema?: Record<string, any>[]
) => {
  let val;
  if (!schema) {
    val = { autodetect: true };
  } else {
    val = { schema: { fields: schema } };
  }
  return client
    .dataset(dataset)
    .table(table)
    .createWriteStream({
      sourceFormat: "NEWLINE_DELIMITED_JSON",
      createDisposition: "CREATE_IF_NEEDED",
      writeDisposition: "WRITE_APPEND",
      schemaUpdateOptions: ["ALLOW_FIELD_ADDITION", "ALLOW_FIELD_RELAXATION"],
      ignoreUnknownValues: true,
      ...val,
    });
};

const { WriterClient, JSONWriter } = managedwriter;
const writeClient = new WriterClient();

const getTableSchema = async (table: string, dataset: string) => {
  const [metadata] = await client.dataset(dataset).table(table).getMetadata();
  return metadata.schema;
};

export const checkTable = async (options: CreateLoadStreamOptions) => {
  const result = await client
    .dataset(options.dataset)
    .table(options.table)
    .get()
    .then(() => "table existed")
    .catch(
      async () =>
        await client
          .dataset(options.dataset)
          .createTable(options.table, {
            schema: options.schema,
            location: "US",
          })
          .then(([table]) => {
            console.log(table.id);
            return table.id;
          })
    );
  return result;
};

export const createStorageWriteStream = async (
  options: CreateLoadStreamOptions,
  rows: any[]
) => {
  try {
    await checkTable(options);
    const schema = await getTableSchema(options.table, options.dataset);
    const streamId = await writeClient.createWriteStream({
      streamType: managedwriter.PendingStream,
      destinationTable: `projects/agile-scheme-394814/datasets/${options.dataset}/tables/${options.table}`,
    });
    const connection = await writeClient.createStreamConnection({
      streamId,
    });
    const protoDescriptor = adapt.convertStorageSchemaToProto2Descriptor(
      adapt.convertBigQuerySchemaToStorageTableSchema(schema),
      options.table
    );

    const writer = new JSONWriter({
      connection,
      protoDescriptor,
    });
    // console.log(rows[0])
    const results = await Promise.all(
      [writer.appendRows(rows, 0)].map((pw) => pw.getResult())
    );
    const rowCount = await connection.finalize();
    const response = await writeClient.batchCommitWriteStream({
      parent: `projects/agile-scheme-394814/datasets/${options.dataset}/tables/${options.table}`,
      writeStreams: [streamId],
    });
    return {
      response,
      ...rowCount,
      rowErrors: results[0].rowErrors,
      error: results[0].error,
    };
  } finally {
    writeClient.close();
  }
};

export const createInsertStream = async (
  options: CreateLoadStreamOptions,
  rows: any
) => {
  return client.dataset(options.dataset).table(options.table).insert(rows, {
    skipInvalidRows: true,
    schema: options.schema,
    createInsertId: true,
  });
};
