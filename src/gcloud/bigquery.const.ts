import knex from "knex";

export const queryBuilder = knex({ client: "mysql" });


type UserDTO = {
    phone_mobile?: string;
    email?: string;
    last_name?: string,
    first_name?:string,
    dob?:{value:string},
    gender?: string;
}

type OfflineConversionDTO = {
  updated_at: string;
    transaction_date: {value:string};
    transaction_code: string;
    
    total: number;
    center_name: string;
    lead_source: string;
  } & UserDTO ;

const OfflineConversionQuery = (date: string) =>
  queryBuilder
    .withSchema("prod_sales")
    .from("fct__conversions")
    .select()
    .whereRaw("date(transaction_date) = ?", date);


type LeadFunnelDTO = {
    created_date: {value:string};
    conversion_date: {value:string};
    status: string;
} & UserDTO


const LeadFunnelQuery = (date: string, status: string) =>
  queryBuilder
    .withSchema("prod_sales")
    .from("fct__lead_funnel")
    .select()
    .whereRaw("date(created_date) = ?", date)
    .where("status", "=", status);



export { OfflineConversionQuery, LeadFunnelQuery, };
export type { OfflineConversionDTO,LeadFunnelDTO ,UserDTO};
