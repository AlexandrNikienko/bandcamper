import axios from 'axios';
import { Release, Track, SalesSummary } from '../types/sales';

const API_BASE = '/api/sales';

export const salesAPI = {
  uploadCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getAllReleases: async (): Promise<Release[]> => {
    const response = await axios.get(`${API_BASE}/releases`);
    return response.data.releases;
  },

  getTopReleases: async (limit: number = 10): Promise<Release[]> => {
    const response = await axios.get(`${API_BASE}/releases/top/${limit}`);
    return response.data.releases;
  },

  getReleaseTracks: async (releaseId: number): Promise<{ release: Release; tracks: Track[] }> => {
    const response = await axios.get(`${API_BASE}/releases/${releaseId}/tracks`);
    return response.data;
  },

  getTopTracks: async (limit: number = 10): Promise<Track[]> => {
    const response = await axios.get(`${API_BASE}/tracks/top/${limit}`);
    return response.data.tracks;
  },

  getSummary: async (): Promise<SalesSummary> => {
    const response = await axios.get(`${API_BASE}/summary`);
    return response.data.summary;
  },

  clearData: async () => {
    const response = await axios.post(`${API_BASE}/clear`);
    return response.data;
  }
};
