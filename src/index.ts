import { http } from "@google-cloud/functions-framework";
import express from "express";
import cors from "cors";

import { FacebookController } from "./facebook/facebook.controller";
import { GoogleAdsController } from "./google-ads/google-ads.controller";
import { CRMController } from "./crm/crm.controller";

const app = express();

app.use(cors());
app.use(express.json());

app.use(({ url, params, body }, _, next) => {
  const log = { url, params, body };
  next();
});

app.use("/facebook", FacebookController);
app.use("/google-ads", GoogleAdsController);
app.use("/crm", CRMController);

// http("main", app);

app.listen(8080, () => {})
