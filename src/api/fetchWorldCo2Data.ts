import { apiSuffix, apiUrl } from "./variables";

export const fetchWorldCo2Data = async (): Promise<WorldCO2DataRow[]> => {
  try {
    // Original source: https://carbonmonitor.org/
    const response = await fetch(`${apiUrl}/world-co2${apiSuffix}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    } 
    
    const data = await response.json();

    return data
    
  } catch (error) {
    throw new Error(`Error fetching world data: ${error}`);
  }
}
