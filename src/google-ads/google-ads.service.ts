import Crypto from "node:crypto";

import {
  getRows,
  OfflineConversionQuery,
  LeadFunnelQuery,
  OfflineConversionDTO,
  LeadFunnelDTO,
} from "../gcloud";

import { formatOfflineEvents, UploadEvent } from "./google-ads.const";

export const getOfflineConversions = async ({ date }: { date: string }) => {
  const rows = await getRows<OfflineConversionDTO>(OfflineConversionQuery(date).toQuery())
    .then((rows) => {
      return rows.map((row: OfflineConversionDTO): UploadEvent => {
        return {
          "Email": row.email
            ? Crypto.createHash("sha256").update(row.email).digest("hex")
            : "",
          "Phone Number": row.phone_mobile
            ? Crypto.createHash("sha256")
                .update("+"+row.phone_mobile)
                .digest("hex")
            : "",
          "Google Click ID": "",
          "Conversion Name": "Offline Purchase",
          "Conversion Time": row.transaction_date,
          "Order ID": row.transaction_code,
          "Conversion Value": row.total,
          "Currency": "VND",
        };
      });
    })
    .then((rows) => rows);
    return formatOfflineEvents(rows);
};

export const getLeadFunnel = async ({
  date,
  status,
}: {
  date: string;
  status: string;
}) => {
  const rows =  await getRows<LeadFunnelDTO>(LeadFunnelQuery(date, status).toQuery())
    .then((rows) => {
      return rows.map((row: LeadFunnelDTO): UploadEvent => {
        return {
          "Email": row.email
            ? Crypto.createHash("sha256").update(row.email).digest("hex")
            : "",
          "Phone Number": row.phone_mobile
            ? Crypto.createHash("sha256")
                .update("+"+row.phone_mobile)
                .digest("hex")
            : "",
          "Google Click ID": "",
          "Conversion Name": `Lead to ${status}`,
          "Conversion Time": row.conversion_date,
          "Order ID": "",
          "Conversion Value": 0,
          "Currency": "VND",
        };
      });
    })
    .then((rows) => rows);
    return formatOfflineEvents(rows);
};
