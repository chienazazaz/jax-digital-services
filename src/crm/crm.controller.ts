import express from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Yup from "yup";

dayjs.extend(utc);

import { createSyncTasks, runPipeline } from "./crm.service";
import { TABLES } from "./crm.const";

export const CRMController = express.Router();

CRMController.use("/sync", async (req, res) => {
  const { updated_to,updated_from, table } = Yup.object({
    updated_from: Yup.string().default(
      dayjs.utc().utcOffset(7).subtract(1, "day").format("YYYY-MM-DD")
    ),
    updated_to: Yup.string().default(
      dayjs.utc().utcOffset(7).format("YYYY-MM-DD")
    ),
    
    table: Yup.string().oneOf(Object.keys(TABLES)).default("leads"),
  }).validateSync(req.body);
  try {
    const result = await runPipeline({ table: table as keyof typeof TABLES, updated_from,updated_to });

    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

CRMController.use("/tasks", async (req, res) => {
  const { updated_from,updated_to } = Yup.object({
    updated_from: Yup.string().default(
      dayjs.utc().utcOffset(7).subtract(1, "day").format("YYYY-MM-DD")
    ),
    updated_to: Yup.string().default(
      dayjs.utc().utcOffset(7).format("YYYY-MM-DD")
    )
    
  }).validateSync(req.body);
  try {
    const result = await createSyncTasks({ updated_from,updated_to });
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error });
  }
});
