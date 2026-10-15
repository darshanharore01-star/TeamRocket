// Person 2: loads real fund data for every option that has a `scheme`, and falls back
// to the illustrative numbers for anything that fails.
import { useEffect, useState } from 'react';
import { investmentOptions } from '../data/investmentOptions';
import { loadLiveOption } from './mfApi';

export function useLiveOptions() {
  const [options, setOptions] = useState(investmentOptions);
  const [status, setStatus] = useState('loading'); // loading | live | partial | offline

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled(investmentOptions.map(loadLiveOption)).then((results) => {
      if (cancelled) return;
      const merged = results.map((r, i) => (r.status === 'fulfilled' ? r.value : investmentOptions[i]));
      const wanted = investmentOptions.filter((o) => o.scheme).length;
      const got = merged.filter((o) => o.live).length;
      setOptions(merged);
      setStatus(got === wanted ? 'live' : got > 0 ? 'partial' : 'offline');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { options, status };
}
