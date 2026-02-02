export interface Release {
  id: number;
  title: string;
  artist: string;
  total_sales: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: number;
  release_id: number;
  title: string;
  sales: number;
  revenue: number;
  release_title?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  releaseCount: number;
  trackCount: number;
  topRelease: Release | null;
  topTrack: Track | null;
}
