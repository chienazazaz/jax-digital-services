import axios from "axios";

import { getSecret } from "../gcloud/secret-manager.service";

const API_VERSION = "v19.0"

export const getClient = async () => {
  const access_token = await getSecret('facebook-user-token');
  return axios.create({
    baseURL: `https://graph.facebook.com/${API_VERSION}`,
    params: { access_token },
  });
};


export type UploadEvent = {
  event_name: string,
  event_time: number,
  event_id: string,
  action_source: 'email'|'website'|'app'|'phone_call'|'chat'|'physical_store'
  user_data: {
      ph?: string[], // phone number
      ge?: string[], // gender
      em?: string[], // email
      db?: string[], // date of birth
      ln?: string[], // last name
      fn?: string[], // first name
  },
  custom_data: {
      currency: 'VND'|'USD',
      value?: number,
      order_id?: string,
      [string : string]: any
  }
}

export type UploadResponse = {
  events_received: number
}


export const uploadEvents = async (data:{data: UploadEvent[]}, eventSetId:number ) => {
  const client = await getClient();

  return client
      .post<UploadResponse>(`/${eventSetId}/events`,data)
      .then((res) => {
        return res.data.events_received
      })
      .catch((error) => {
          if (axios.isAxiosError(error)) {
              console.error(JSON.stringify(error.response?.data));
          }
          return Promise.reject(error);
      });
};