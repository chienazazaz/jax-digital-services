import knex from "knex";

export const queryBuilder = knex({ client: "mysql" });


type UserDTO = {
    contact_number?: string;
    email?: string;
    last_name?: string,
    first_name?:string,
    date_of_birth?:string,
    gender?: string;
}

type OfflineConversionDTO = {
    created_date: string;
    transaction_date: string;
    transaction_code: string;
    
    total: number;
    branch_name: string;
    lead_source: string;
  } & UserDTO ;

const OfflineConversionQuery = (date: string) =>
  queryBuilder
    .withSchema("dbt_prod_marketing")
    .from("fct__conversions")
    .select()
    .whereRaw("date(created_date) = ?", date);


type LeadFunnelDTO = {
    created_date: string;
    conversion_date: string;
    status: string;
} & UserDTO


const LeadFunnelQuery = (date: string, status: string) =>
  queryBuilder
    .withSchema("dbt_prod_marketing")
    .from("fct__lead_funnel")
    .select()
    .whereRaw("date(created_date) = ?", date)
    .where("status", "=", status);



export { OfflineConversionQuery, LeadFunnelQuery, };
export type { OfflineConversionDTO,LeadFunnelDTO ,UserDTO};
