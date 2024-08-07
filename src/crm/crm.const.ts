import * as mysql from "mysql";

export const TABLES = {
  teams: { date_field: "date_modified", id_field: "id" },
  j_class: { date_field: "date_modified", id_field: "id" },
  contacts: { date_field: "date_modified", id_field: "id" },
  leads: { date_field: "date_modified", id_field: "id" },
  leads_audit: { date_field: "date_created", id_field: "id" },
  c_teachers: { date_field: "date_modified", id_field: "id" },
  j_gradebook: { date_field: "date_modified", id_field: "id" },
  j_gradebookdetail: { date_field: "date_modified", id_field: "id" },
  c_attendance: { date_field: "date_modified", id_field: "id" },
  j_kindofcourse: { date_field: "date_modified", id_field: "id" },
  j_coursefee: { date_field: "date_modified", id_field: "id" },
  j_gradebookconfig: { date_field: "date_modified", id_field: "id" },
  j_studentsituations: { date_field: "date_modified", id_field: "id" },
};

export const CONNECTION = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || "3306"),
});
