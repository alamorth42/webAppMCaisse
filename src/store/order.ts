import { create } from 'zustand'

interface MenuItem {
  id: string;
  options?: any | null;
  description: string;
  dispo?: boolean;
  hasoption?: boolean;
  identifier?: string;
  prix: number;
  price: number;
  titre: string;
  type: string;
  url: string;
  urls: { id: string; type: number; url: string }[];
}

interface OptionChoose {
  titre: string;
  price: number | null;
  required: boolean;
  number: number;
  idOptionGroup: string;
  titreGroup: string;
}

interface OrderMenu {
  menu: MenuItem;
  options?: OptionChoose[] | null;
  number: number;
  id: string;
  isSend: false;
}

interface OrderState {
  data: OrderMenu[];
  orderRecord: any;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  addMenuItem: (menu: OrderMenu, checkOptions?: boolean, menuId?: string) => void;
  deleteMenuItem: (itemId: string, menuId?: string, searchById?: boolean) => void;
  deleteMenu: (itemId: string, menuId: string, menu: OrderMenu) => void;
  clearOrderData: () => void;
  setError?: (message: any) => void;
}

const calculateTotalPrice = (data: OrderMenu[]): number => {
  return data.reduce((total, item) => {
    const itemTotal = item.menu.price * item.number;
    const optionsTotal = item?.options ? item?.options?.reduce((optionTotal, option) => optionTotal + ((option?.price || 0) / 100), 0) * item?.number || 0 : 0;
    return total + itemTotal + optionsTotal;
  }, 0);
};

const areOptionsEqual = (options1: OptionChoose[] | undefined, options2: OptionChoose[] | undefined): boolean => {
  if (options1 === options2) return true;
  if (!options1 || !options2 || options1.length !== options2.length) return false;
  return options1.every((opt1, index) => {
    const opt2 = options2[index];
    return (
      opt1.titre === opt2.titre &&
      ((opt1.price || 0) / 100) === ((opt2.price || 0) / 100) &&
      opt1.required === opt2.required &&
      opt1.number === opt2.number &&
      opt1.idOptionGroup === opt2.idOptionGroup &&
      opt1.titreGroup === opt2.titreGroup
    );
  });
};

const useOrderStore = create<OrderState>((set) => ({
  data: [],
  orderRecord: {},
  totalPrice: 0,
  loading: false,
  error: null,
  fetchData: async () => { },
  addMenuItem: (menuItem, checkOptions, menuId) => set((state) => {
    if (checkOptions === true) {
      const existingItem = menuId ? state.data.find(item =>
        item.id === menuId &&
        item.options && menuItem.options &&
        areOptionsEqual(item.options, menuItem.options)
      ) : state.data.find(item =>
        item.menu.id === menuItem.menu.id &&
        item.options && menuItem.options &&
        areOptionsEqual(item.options, menuItem.options)
      );

      let newData;

      if (existingItem) {
        newData = state.data.map(item =>
          item.menu.id === menuItem.menu.id && areOptionsEqual(item.options || [], menuItem.options || [])
            ? { ...item, number: item.number + 1 }
            : item
        );
      } else {
        newData = [...state.data, menuItem];
      }
      const newTotalPrice = calculateTotalPrice(newData) || 0;
      //console.log('newTotalPrice', newTotalPrice);

      return {
        data: newData,
        orderRecord: { ...state.orderRecord, [menuItem.menu.id]: (state.orderRecord[menuItem.menu.id] || 0) + 1 },
        totalPrice: newTotalPrice,
      };
    } else {
      const existingItem = menuId ? state.data.find(item => item.id === menuId) : state.data.find(item => item.menu.id === menuItem.menu.id);
      let newData;

      if (existingItem) {
        newData = menuId ?
          state.data.map(item => item.id === menuId ? { ...item, number: item.number + 1 } : item)
          : state.data.map(item => item.menu.id === menuItem.menu.id ? { ...item, number: item.number + 1 } : item);
      } else {
        newData = [...state.data, menuItem];
      }
      const newTotalPrice = calculateTotalPrice(newData) || 0;
      //console.log('newTotalPrice', newTotalPrice);

      return {
        data: newData,
        orderRecord: { ...state.orderRecord, [menuItem.menu.id]: (state.orderRecord[menuItem.menu.id] || 0) + 1 },
        totalPrice: newTotalPrice,
      };
    }
  }),

  deleteMenuItem: (itemId, menuId, searchById) => set((state) => {
    const lastIndex = state.data.length - 1;

    if (searchById) {
      let found = false;
      const newData: OrderMenu[] = state.data.map((item) => {
        if (item.id === menuId) {
          found = true;
          return {
            ...item,
            number: item.number - 1
          }
        }
        return item;
      }).filter(item => item.number > 0);

      if (!found) {
        return state; // No item with menuId found
      }

      const newTotalPrice = calculateTotalPrice(newData);

      const newOrderRecord = { ...state.orderRecord };
      const currentCount = state.orderRecord[itemId] || 0;
      if (currentCount === 1) {
        delete newOrderRecord[itemId];
      } else {
        newOrderRecord[itemId] = currentCount - 1;
      }

      return {
        data: newData,
        orderRecord: newOrderRecord,
        totalPrice: newTotalPrice,
      };
    } else {
      const lastAddedItemIndex = state.data.slice().reverse().findIndex(item => item.menu.id === itemId);

      if (lastAddedItemIndex === -1) {
        return state; // No item with itemId found
      }

      const actualIndex = lastIndex - lastAddedItemIndex;
      const lastAddedItem = state.data[actualIndex];
      let newData;

      if (lastAddedItem.number === 1) {
        newData = [...state.data.slice(0, actualIndex), ...state.data.slice(actualIndex + 1)];
      } else {
        newData = [
          ...state.data.slice(0, actualIndex),
          { ...lastAddedItem, number: lastAddedItem.number - 1 },
          ...state.data.slice(actualIndex + 1),
        ];
      }

      const newTotalPrice = calculateTotalPrice(newData);

      const newOrderRecord = { ...state.orderRecord };
      const currentCount = state.orderRecord[itemId] || 0;
      if (currentCount === 1) {
        delete newOrderRecord[itemId];
      } else {
        newOrderRecord[itemId] = currentCount - 1;
      }

      return {
        data: newData,
        orderRecord: newOrderRecord,
        totalPrice: newTotalPrice,
      };
    }
  }),


  deleteMenu: (itemId, menuId, menu) => set((state) => {
    const newData = state.data.filter(item => item.id !== itemId);
    const newTotalPrice = calculateTotalPrice(newData);

    const newOrderRecord = { ...state.orderRecord };
    if (menu?.options?.length) {
      newOrderRecord[menuId] -= menu.number
    } else {
      delete newOrderRecord[menuId];
    }

    return {
      data: newData,
      orderRecord: newOrderRecord,
      totalPrice: newTotalPrice,
    };
  }),
  clearOrderData: () => set((state) => {
    return {
      data: [],
      orderRecord: {},
      totalPrice: 0,
    };
  }),
  setError: (message: any) => {
    set({ error: message, loading: false });
  }
}));

export default useOrderStore;
