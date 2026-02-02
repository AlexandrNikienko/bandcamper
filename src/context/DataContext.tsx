import React, { createContext, useContext, useState, ReactNode } from 'react';
import Papa from 'papaparse';
import { Release, Track } from '../types/sales';

const DataContext = createContext<any>(undefined);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

function normalizeItemTitle(itemName: string, containerName?: string) {
  // Prefer explicit container name (release/bundle). Fall back to parsing item name by ' - '
  if (containerName && String(containerName).trim() !== '') {
    const releaseTitle = String(containerName).trim();
    // If itemName contains a dash, try to extract track title
    const parts = String(itemName || '').split(' - ');
    const trackTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : String(itemName || '').trim();
    return { releaseTitle, trackTitle };
  }

  const parts = String(itemName || '').split(' - ');
  const releaseTitle = parts[0]?.trim() || 'Unknown Release';
  const trackTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : String(itemName || '').trim();
  return { releaseTitle, trackTitle };
}

function parseCurrencyNumber(value: any) {
  if (value == null) return 0;
  const s = String(value).trim();
  if (s === '') return 0;
  // Remove currency symbols and thousands separators, keep dot/minus
  const cleaned = s.replace(/[^0-9.\-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [releases, setReleases] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const rebuildSummary = (releasesArr: any[], tracksArr: any[]) => {
    const totalSales = releasesArr.reduce((s, r) => s + (r.totalSales || 0), 0);
    const totalRevenue = releasesArr.reduce((s, r) => s + (r.totalRevenue || 0), 0);
    const releaseCount = releasesArr.length;
    const trackCount = tracksArr.length;
    const topRelease = releasesArr.slice().sort((a, b) => b.totalSales - a.totalSales)[0] || null;
    const topTrack = tracksArr.slice().sort((a, b) => b.sales - a.sales)[0] || null;

    setSummary({ totalSales, totalRevenue, releaseCount, trackCount, topRelease, topTrack });
  };

  const processCSV = async (file: File) => {
    return new Promise((resolve: any, reject: any) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const data = results.data as any[];

          const releaseMap = new Map<string, Release>();
          const trackMap = new Map<string, Track>();

          for (const record of data) {
            // Use Bandcamp CSV canonical column names when present
            const itemName = record['Item name'] || record['Item Name'] || record['Item Title'] || record['Item title'] || record['Item'] || '';
            const containerName = record['Container name'] || record['Container Name'] || record['Container'] || '';
            const artistName = record['Artist name'] || record['Artist Name'] || record['Artist'] || 'Unknown Artist';
            const itemTypeRaw = String(record['Item type'] || record['Item Type'] || record['item type'] || '').toLowerCase();

            // Quantity is typically an integer
            const quantity = parseInt(record['Quantity'] ?? record['quantity'] ?? '1', 10) || 1;

            // Use Net revenue column strictly for reporting (per user's request)
            const netRevenue = parseCurrencyNumber(record['Net revenue'] ?? record['Net Revenue'] ?? record['Net'] ?? record['Net amount']);
            const revenue = netRevenue; // do not fallback to gross; treat missing net as 0

            if (!itemName && !containerName) continue;

            const itemType = itemTypeRaw;

            // Determine release title and track title based on item type
            let releaseTitle = '';
            let trackTitle = '';

            if (itemType === 'track') {
              // Tracks: containerName should point to release
              releaseTitle = String(containerName).trim() || normalizeItemTitle(String(itemName)).releaseTitle;
              trackTitle = normalizeItemTitle(String(itemName)).trackTitle;
            } else if (itemType === 'album' || itemType === 'bundle') {
              // Albums and bundles: the item itself represents a release-level sale
              releaseTitle = String(itemName || containerName).trim();
              // For album rows, there may be no track title
              trackTitle = '';
            } else {
              // Unknown type: try to infer
              const inferred = normalizeItemTitle(String(itemName), containerName);
              releaseTitle = inferred.releaseTitle;
              trackTitle = inferred.trackTitle;
            }

            if (!releaseTitle) continue;

            // Ensure release exists
            if (!releaseMap.has(releaseTitle)) {
              releaseMap.set(releaseTitle, {
                title: releaseTitle,
                artist: String(artistName) || 'Unknown Artist',
                totalSales: 0,
                totalRevenue: 0,
                albumSales: 0,
                albumRevenue: 0
              });
            }

            const rel = releaseMap.get(releaseTitle)!;

            // Combine sales: quantity contributes to counts; revenue uses Net revenue
            rel.totalSales += quantity;
            rel.totalRevenue += revenue;

            // Track album-only sales (from 'album' or 'bundle' type rows)
            if (itemType === 'album' || itemType === 'bundle') {
              rel.albumSales += quantity;
              rel.albumRevenue += revenue;
            }

            // If this row is a track, add/update track map
            if (itemType === 'track' || trackTitle) {
              const key = `${releaseTitle}||${trackTitle}`;
              if (trackMap.has(key)) {
                const t = trackMap.get(key)!;
                t.sales += quantity;
                t.revenue += revenue;
              } else {
                trackMap.set(key, {
                  releaseTitle: releaseTitle,
                  title: trackTitle || String(itemName).trim(),
                  sales: quantity,
                  revenue
                });
              }
            }
          }

          const releasesArr = Array.from(releaseMap.values());
          const tracksArr = Array.from(trackMap.values());

          setReleases(releasesArr);
          setTracks(tracksArr);
          rebuildSummary(releasesArr, tracksArr);

          resolve({ releasesProcessed: releasesArr.length, tracksProcessed: tracksArr.length });
        },
        error: (err) => reject(err)
      });
    });
  };

  const clearData = () => {
    setReleases([]);
    setTracks([]);
    setSummary(null);
  };

  return (
    <DataContext.Provider value={{ releases, tracks, summary, processCSV, clearData }}>
      {children}
    </DataContext.Provider>
  );
};
