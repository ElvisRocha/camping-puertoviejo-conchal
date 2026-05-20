import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const SITE_OFFLINE_QUERY_KEY = ['site-offline'] as const;

async function fetchSiteOfflineFlag(): Promise<boolean> {
  const { data, error } = await supabase
    .from('camping_settings')
    .select('value')
    .eq('key', 'site_offline')
    .maybeSingle();

  if (error || !data) return false;
  return data.value === 'true';
}

export function useSiteOfflineStatus() {
  const { data, isLoading } = useQuery({
    queryKey: SITE_OFFLINE_QUERY_KEY,
    queryFn: fetchSiteOfflineFlag,
    staleTime: 60_000,
    retry: 1,
  });

  return { isOffline: data ?? false, isLoading };
}
