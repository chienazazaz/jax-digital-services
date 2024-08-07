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
import { uploadEvents,UploadEvent } from "./facebook.const";

const hashedUserData: Record<string, keyof UserDTO> = {
  ph: "contact_number",
  em: "email",
  ln: "last_name",
  fn: "first_name",
  db: "date_of_birth",
  ge: "gender",
};

const eventSetId = parseInt(process.env.FACEBOOK_EVENT_SET_ID||"0");

export const uploadOfflineConversions = async ({ date }: { date: string }) => {
  return getRows<OfflineConversionDTO>(OfflineConversionQuery(date).toQuery())
    .then((rows) => {
      return rows.map((row: OfflineConversionDTO): UploadEvent => {
        return {
          event_name: "Purchase",
          event_time: dayjs(row.transaction_date).utcOffset(7).unix(),
          event_id: row.transaction_code,
          action_source: row.lead_source as any,
          user_data: Object.entries(hashedUserData).reduce(
            (acc: Record<string, any>, [key, value]) => {
              acc[key] = row[value]
                ? [
                    Crypto.createHash("sha256")
                      .update(row[value] as string)
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
            branch_name: row.branch_name,
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
          event_time: dayjs(row.conversion_date).utcOffset(7).unix(),
          event_id: `${row.contact_number || row.email}-${
            row.conversion_date
          }-${row.status}`,
          action_source: "physical_store",
          user_data: Object.entries(hashedUserData).reduce(
            (acc: Record<string, any>, [key, value]) => {
              acc[key] = row[value]
                ? [
                    Crypto.createHash("sha256")
                      .update(row[value] as string)
                      .digest("hex"),
                  ]
                : undefined;
              return acc;
            },
            {}
          ),
          custom_data: {
            currency: "VND",
            order_id: `${row.contact_number || row.email}-${
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
