import { convertToCSV } from "../utilities";

type UploadEvent = {
  "Email": string;
  "Phone Number": string;
  "Conversion Name": string;
  "Conversion Time": string;
  "Order ID"?: string;
  "Conversion Value"?: number;
  "Currency"?: string;
  "Google Click ID"?: string;
};

const formatOfflineEvents = (rows: UploadEvent[]) => {
    return convertToCSV(rows);
}

export {formatOfflineEvents}
export type { UploadEvent };