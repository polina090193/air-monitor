import { useCallback, useEffect, useState } from 'react'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [worldData, setWorldData] = useState({})

  const loadWorldData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Original source: https://carbonmonitor.org/
      const fetchedWorldData = await fetch('../data/world_data.json')

      if (fetchedWorldData.ok) {
        const worldDataJson = await fetchedWorldData.json();
        setWorldData(worldDataJson)
      } else {
        console.error('Error fetching world data:', fetchedWorldData.statusText);
      }
    } catch (error) {
      console.error('Error fetching world data:', error)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadWorldData()
  }, [loadWorldData])

  return (
    <>
      {isLoading ? 'Loading...' 
        : worldData 
          ? JSON.stringify(worldData) 
          : 'No data'}
    </>
  )
}

export default App
