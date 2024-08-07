import express from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Yup from "yup";

dayjs.extend(utc);

import { createSyncTasks, runPipeline } from "./crm.service";
import { TABLES } from "./crm.const";

export const CRMController = express.Router();

CRMController.use("/sync", async (req, res) => {
  const { date, table } = Yup.object({
    date: Yup.string().default(
      dayjs.utc().utcOffset(7).subtract(1, "day").format("YYYY-MM-DD")
    ),
    table: Yup.string().oneOf(Object.keys(TABLES)).default("leads"),
  }).validateSync(req.body);
  try {
    const result = await runPipeline({ table: table as keyof typeof TABLES, updated: date });

    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

CRMController.use("/tasks", async (req, res) => {
  const { date } = Yup.object({
    date: Yup.string().default(
      dayjs.utc().utcOffset(7).subtract(1, "day").format("YYYY-MM-DD")
    ),
  }).validateSync(req.body);
  try {
    const result = await createSyncTasks({ date });
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error });
  }
});
