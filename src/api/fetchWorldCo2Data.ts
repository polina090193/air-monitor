export const fetchWorldCo2Data = async (): Promise<WorldCO2DataRow[]> => {
  try {
    // Original source: https://carbonmonitor.org/
    const fetchedWorldData = await fetch('/world_data.json')
  
    if (fetchedWorldData.ok) {
      return await fetchedWorldData.json();
  
    } else {
      throw new Error(`Error fetching world data: ${fetchedWorldData.statusText}`);
    }
  } catch (error) {
    throw new Error(`Error fetching world data: ${error}`);
  }
}
