import axios from 'axios';
import { create } from 'zustand';

interface servicesEnCoursType {
  dateOuverture: string;
  idService: string;
}
interface UserData {
  pseudo: string;
  ville: string;
  codePostal: string;
  activity: string;
  allowSurPlace: boolean;
  allowClickAndCollect: boolean;
  servicesEnCours: servicesEnCoursType | null;
  minMax: number;
  hourMax: number;
}

interface UserState {
  data: UserData;
  loading: boolean;
  error: string | null;
  fetchData?: (userId: string) => Promise<void>;
  setError?: (message: any) => void;
}

const useUserStore = create<UserState>((set) => ({
  data: {
    "pseudo": "Akhi Place",
    "ville": "Sevran",
    "codePostal": "93270",
    "activity": "Commerce",
    "allowSurPlace": true,
    "allowClickAndCollect": true,
    "servicesEnCours": null,
    "minMax": 0,
    "hourMax": 23
  },
  loading: true,
  error: null,
  fetchData: async (userId) => {
    try {
      const responseApi = await axios.get(
        `https://europe-west1-miamapp-cc1ca.cloudfunctions.net/getDataFromUserID?userId=${userId}`,
        {
          headers: {
            'api-key': 'voldiTest',
          },
        }
      );

      //console.log('responseApi', responseApi.data);
      set({ data: responseApi.data, loading: false });
    } catch (error: any) {
      console.log(error);
      set({ error: error.message, loading: false });
    }
  },
  setError: (message: any) => {
    set({ error: message, loading: false });
  }
}));

export default useUserStore;