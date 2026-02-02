export interface Release {
  id: number;
  title: string;
  artist: string;
  totalSales: number;
  totalRevenue: number;
  albumSales: number;
  albumRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: number;
  releaseId: number;
  title: string;
  sales: number;
  revenue: number;
  releaseTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  releaseCount: number;
  trackCount: number;
  topRelease: Release | null;
  topTrack: Track | null;
  bundleSales?: number;
  bundleRevenue?: number;
}
