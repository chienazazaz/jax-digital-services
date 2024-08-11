import { chunk, sum } from "lodash";
import Crypto from "node:crypto";
import dayjs from "dayjs";

import {
  getRows,
  OfflineConversionQuery,
  LeadFunnelQuery,
  OfflineConversionDTO,
  LeadFunnelDTO,
  UserDTO,
} from "../gcloud";
import { uploadEvents, UploadEvent } from "./facebook.const";

const hashedUserData: Record<string, keyof UserDTO> = {
  ph: "phone_mobile",
  em: "email",
  ln: "last_name",
  fn: "first_name",
  db: "dob",
  ge: "gender",
};

const eventSetId = parseInt(
  process.env.FACEBOOK_EVENT_SET_ID || "828112619424322"
);

export const uploadOfflineConversions = async ({ date }: { date: string }) => {
  const rows = await getRows<OfflineConversionDTO>(
    OfflineConversionQuery(date).toQuery()
  );
  const params = rows.map((row: OfflineConversionDTO): UploadEvent => {
    return {
      event_name: "Purchase",
      event_time: dayjs(row.transaction_date.value).utcOffset(7).unix(),
      event_id: row.transaction_code,
      action_source: 'physical_store',
      user_data: Object.entries(hashedUserData).reduce(
        (acc: Record<string, any>, [key, value]) => {
          acc[key] =
            row[value] && typeof row[value] === "string"
              ? [
                  Crypto.createHash("sha256")
                    .update(row[value] as string)
                    .digest("hex"),
                ]
              : typeof row[value] != "string" && row[value]
              ? [
                  Crypto.createHash("sha256")
                    .update((row[value] as any).value as string)
                    .digest("hex"),
                ]
              : undefined;

          return acc;
        },
        {}
      ),
      custom_data: {
        currency: "VND",
        value: row.total,
        order_id: row.transaction_code,
        branch_name: row.center_name,
      },
    };
  });
  const chunks = chunk(params, 100);
  const results = await Promise.all(
    chunks.map((chunk) => {
      return uploadEvents({ data: chunk }, eventSetId);
    })
  );
  return sum(results);
};

export const uploadLeadFunnel = async ({
  date,
  status,
}: {
  date: string;
  status: string;
}) => {
  return getRows(LeadFunnelQuery(date, status).toQuery())
    .then((rows) => {
      return rows.map((row: LeadFunnelDTO): UploadEvent => {
        return {
          event_name: "CompleteRegistration",
          event_time: dayjs(row.conversion_date.value).utcOffset(7).unix(),
          event_id: `${row.phone_mobile || row.email}-${row.conversion_date}-${
            row.status
          }`,
          action_source: "phone_call",
          user_data: Object.entries(hashedUserData).reduce(
            (acc: Record<string, any>, [key, value]) => {
              acc[key] =
                row[value] && typeof row[value] === "string"
                  ? [
                      Crypto.createHash("sha256")
                        .update(row[value] as string)
                        .digest("hex"),
                    ]
                  : typeof row[value] != "string" && row[value]
                  ? [
                      Crypto.createHash("sha256")
                        .update((row[value] as any).value as string)
                        .digest("hex"),
                    ]
                  : undefined;

              return acc;
            },
            {}
          ),
          custom_data: {
            currency: "VND",
            order_id: `${row.phone_mobile || row.email}-${
              row.conversion_date
            }-${row.status}`,
            status: row.status,
          },
        };
      });
    })
    .then((rows) => {
      return chunk(rows, 100);
    })
    .then((chunks) => {
      const requests = chunks.map((chunk) =>
        uploadEvents({ data: chunk }, eventSetId)
      );
      return Promise.all(requests);
    })
    .then((numProcesseds) => {
      return sum(numProcesseds);
    });
};
