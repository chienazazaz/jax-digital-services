import express from "express";
import * as Yup from "yup";
import dayjs from "dayjs";
import { getOfflineConversions, getLeadFunnel } from "./google-ads.service";

export const GoogleAdsController = express.Router();

GoogleAdsController.use("/offline-conversion", async (req, res) => {
  const { date } = Yup.object({
    date: Yup.string().default(
      dayjs.utc().utcOffset(7).subtract(1, "day").format("YYYY-MM-DD")
    ),
  }).validateSync(req.query);
  try {
    const result = await getOfflineConversions({ date });
    return res.status(200).attachment(`offline-conversion_${date}.csv`).send(result);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

GoogleAdsController.use("/lead-funnel", async (req, res) => {
  const { date, status } = Yup.object({
    date: Yup.string().default(
      dayjs.utc().utcOffset(7).subtract(1, "day").format("YYYY-MM-DD")
    ),
    status: Yup.string().default("Converted"),
  }).validateSync(req.query);
  try {
    const result = await getLeadFunnel({ date,status });
    return res.status(200).attachment(`lead-funnel_${status}_${date}.csv`).send(result);
  } catch (error) {
    return res.status(500).json({ error });
  }
});
