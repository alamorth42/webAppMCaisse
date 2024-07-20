

import axios from 'axios';
import { create } from 'zustand'

interface TableState {
  data: any;
  loading: boolean;
  error: string | null;
  fetchData?: (userId: string) => Promise<void>;
  activeTabHandler?: any;
  setError?: (message: any) => void;
}

const categoryOrder: any = {
  'Entrée': 0,
  'Plat': 1,
  'Spécialité Maison': 2,
  'Formules': 3,
  'Super Side Salés': 4,
  'Pizza': 5,
  'Pâtes': 6,
  'Sandwichs': 7,
  'Super Side Sucrés': 8,
  'Accompagnement': 9,
  'Boisson': 989,
  'Milkshake': 990,
  'Bubble Tea': 991,
  'Dessert': 992,
};

const useMenuStore = create<TableState>((set) => ({
  data: {},
  loading: true,
  error: null,
  fetchData: async (userId) => {
    set({ loading: true });
    try {
      const responseApi = await axios.get(
        `https://europe-west1-miamapp-cc1ca.cloudfunctions.net/getMenuFromID?userId=${userId}`,
        {
          headers: {
            'api-key': 'voldiTest',
          },
        }
      );

      // const tabsObj: any = {};
      // responseApi?.data?.forEach((row: any, index: number) => {
      //   tabsObj[row.type] = row.type
      // });
      // const tabs = Object.values(tabsObj);

      const tabsObj: any = {};
      responseApi?.data?.forEach((row: any) => {
        tabsObj[row.type] = row.type;
      });

      // Assign unknown categories to a unique order between 9 and 989
      let unknownOrder = 10;
      Object.keys(tabsObj).forEach((type) => {
        if (categoryOrder[type] === undefined) {
          categoryOrder[type] = unknownOrder++;
        }
      });

      const sortedTabs = Object.keys(tabsObj).sort((a, b) => {
        return categoryOrder[a] - categoryOrder[b];
      });


      set({ data: { menu: responseApi.data, tabs: sortedTabs, activeTab: sortedTabs?.length > 0 ? sortedTabs[0] : null }, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  activeTabHandler: (activeTab: string) => {
    set((state) => {
      if (state.data) {
        return {
          data: { ...state.data, activeTab },
          loading: false,
          error: null,
        };
      }
      return state;
    });
  },
  setError: (message: any) => {
    set({ error: message, loading: false });
  }
}));

export default useMenuStore;