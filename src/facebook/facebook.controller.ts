import express from "express";
import Yup from "yup";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
import { uploadLeadFunnel, uploadOfflineConversions } from "./facebook.service";

export const FacebookController = express.Router();

FacebookController.use("/conversion", async (req, res) => {
  const { date } = Yup.object({
    date: Yup.string().default(
      dayjs.utc().utcOffset(7).subtract(1, "day").format("YYYY-MM-DD")
    ),
  }).validateSync(req.body);
  try {
    const result = await uploadOfflineConversions({ date });
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

FacebookController.use("/lead-funnel", async (req, res) => {
  const { date, status } = Yup.object({
    date: Yup.string().default(
      dayjs.utc().utcOffset(7).subtract(1, "day").format("YYYY-MM-DD")
    ),
    status: Yup.string().default("Converted"),
  }).validateSync(req.body);
  try {
    const result = await uploadLeadFunnel({ date, status });
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error });
  }
});
