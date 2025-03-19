export const fetchWorldCo2Data = async (): Promise<WorldCO2DataRow[]> => {
  try {
    // Original source: https://carbonmonitor.org/
    const response = await fetch('https://h4nz7c0yxg.execute-api.eu-north-1.amazonaws.com/world-co2');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    } 
    
    const data = await response.json();
    return data
    
  } catch (error) {
    throw new Error(`Error fetching world data: ${error}`);
  }
}
