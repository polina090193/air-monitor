import { useQuery } from '@tanstack/react-query';
import { API_MAP } from '../api/apiMap';

export const useFetchData = (key: string) => {
  const fetchFunction = API_MAP[key];
  if (typeof fetchFunction !== 'function') {
    throw new Error(`Invalid fetch function for key: ${key}`);
  }

  return useQuery({
    queryKey: [key],
    queryFn: fetchFunction,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1
  })
};
