

import axios from 'axios';
import { create } from 'zustand'

interface TableData {
  id: string;
  name: string;
  numberCouverts: number;
  shape: string;
  scale: number;
  x: number;
  y: number;
  salleID: string;
}

interface TableState {
  data: TableData | null;
  loading: boolean;
  error: string | null;
  fetchData?: (userId: string, salleId: string, tableId: string) => Promise<void>;
  setError?: (message: any) => void;
}

const useTableStore = create<TableState>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetchData: async (userId, salleId, tableId) => {
    set({ loading: true });
    try {
      const responseApi = await axios.get(
        `https://europe-west1-miamapp-cc1ca.cloudfunctions.net/getTable?userId=${userId}&salleId=${salleId}&tableId=${tableId}`,
        {
          headers: {
            'api-key': 'voldiTest',
          },
        }
      );
      //console.log('responseApi', responseApi.data);
      set({ data: responseApi.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  setError: (message: any) => {
    set({ error: message, loading: false });
  }
}));

export default useTableStore;