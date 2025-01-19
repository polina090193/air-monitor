import { fetchWorldCo2Data } from "./fetchWorldCo2Data";

export const API_MAP: {
  [key: string]: () => Promise<unknown>;
} = {
  yearWorldCO2: fetchWorldCo2Data,
}
