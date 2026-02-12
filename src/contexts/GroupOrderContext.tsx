import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { OrderItem, GuestOrder } from "@/types/order";
import { ServiceSelection, OrderInfo } from "@/types/order";

interface GroupOrderState {
  // Order setup data
  orderInfo: OrderInfo | null;
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  
  // Group order specific data
  invitedGuests: string[];
  paymentMethod: string;
  orderType: boolean; // true = group, false = individual
  additionalNotes: string;
  
  // Guest orders
  guestOrders: GuestOrder[];
  
  // Order status
  orderId: string | null;
  isSubmitting: boolean;
  
  // Vendor details
  vendorName: string;
  vendorImage: string;
  
  // Cutoff time for guest orders
  cutoffTime: Date | null;
}

type GroupOrderAction = 
  | { type: 'SET_ORDER_INFO'; payload: OrderInfo }
  | { type: 'SET_SELECTED_SERVICES'; payload: ServiceSelection[] }
  | { type: 'SET_SELECTED_ITEMS'; payload: Record<string, number> }
  | { type: 'SET_INVITED_GUESTS'; payload: string[] }
  | { type: 'ADD_GUEST'; payload: string }
  | { type: 'REMOVE_GUEST'; payload: string }
  | { type: 'SET_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_ORDER_TYPE'; payload: boolean }
  | { type: 'SET_ADDITIONAL_NOTES'; payload: string }
  | { type: 'SET_GUEST_ORDERS'; payload: GuestOrder[] }
  | { type: 'ADD_GUEST_ORDER'; payload: GuestOrder }
  | { type: 'UPDATE_GUEST_ORDER'; payload: { id: string; updates: Partial<GuestOrder> } }
  | { type: 'SET_ORDER_ID'; payload: string }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_VENDOR_DETAILS'; payload: { name: string; image: string } }
  | { type: 'SET_CUTOFF_TIME'; payload: Date }
  | { type: 'RESET_ORDER' };

const initialState: GroupOrderState = {
  orderInfo: null,
  selectedServices: [],
  selectedItems: {},
  invitedGuests: [],
  paymentMethod: "host-pays",
  orderType: true,
  additionalNotes: "",
  guestOrders: [],
  orderId: null,
  isSubmitting: false,
  vendorName: "",
  vendorImage: "",
  cutoffTime: null
};

function groupOrderReducer(state: GroupOrderState, action: GroupOrderAction): GroupOrderState {
  switch (action.type) {
    case 'SET_ORDER_INFO':
      return { ...state, orderInfo: action.payload };
    case 'SET_SELECTED_SERVICES':
      return { ...state, selectedServices: action.payload };
    case 'SET_SELECTED_ITEMS':
      return { ...state, selectedItems: action.payload };
    case 'SET_INVITED_GUESTS':
      return { ...state, invitedGuests: action.payload };
    case 'ADD_GUEST':
      return { 
        ...state, 
        invitedGuests: [...state.invitedGuests, action.payload] 
      };
    case 'REMOVE_GUEST':
      return { 
        ...state, 
        invitedGuests: state.invitedGuests.filter(email => email !== action.payload) 
      };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    case 'SET_ORDER_TYPE':
      return { ...state, orderType: action.payload };
    case 'SET_ADDITIONAL_NOTES':
      return { ...state, additionalNotes: action.payload };
    case 'SET_GUEST_ORDERS':
      return { ...state, guestOrders: action.payload };
    case 'ADD_GUEST_ORDER':
      return { 
        ...state, 
        guestOrders: [...state.guestOrders, action.payload] 
      };
    case 'UPDATE_GUEST_ORDER':
      return {
        ...state,
        guestOrders: state.guestOrders.map(order => 
          order.id === action.payload.id 
            ? { ...order, ...action.payload.updates }
            : order
        )
      };
    case 'SET_ORDER_ID':
      return { ...state, orderId: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_VENDOR_DETAILS':
      return { 
        ...state, 
        vendorName: action.payload.name, 
        vendorImage: action.payload.image 
      };
    case 'SET_CUTOFF_TIME':
      return { ...state, cutoffTime: action.payload };
    case 'RESET_ORDER':
      return initialState;
    default:
      return state;
  }
}

interface GroupOrderContextValue {
  state: GroupOrderState;
  dispatch: Dispatch<GroupOrderAction>;
  
  // Helper functions
  setOrderInfo: (orderInfo: OrderInfo) => void;
  setSelectedServices: (services: ServiceSelection[]) => void;
  setSelectedItems: (items: Record<string, number>) => void;
  addGuest: (email: string) => void;
  removeGuest: (email: string) => void;
  setPaymentMethod: (method: string) => void;
  setOrderType: (isGroup: boolean) => void;
  setAdditionalNotes: (notes: string) => void;
  addGuestOrder: (order: GuestOrder) => void;
  updateGuestOrder: (id: string, updates: Partial<GuestOrder>) => void;
  setVendorDetails: (name: string, image: string) => void;
  setCutoffTime: (time: Date) => void;
  resetOrder: () => void;
}

const GroupOrderContext = createContext<GroupOrderContextValue | undefined>(undefined);

export const useGroupOrder = () => {
  const context = useContext(GroupOrderContext);
  if (!context) {
    throw new Error('useGroupOrder must be used within a GroupOrderProvider');
  }
  return context;
};

interface GroupOrderProviderProps {
  children: ReactNode;
}

export function GroupOrderProvider({ children }: GroupOrderProviderProps) {
  const [state, dispatch] = useReducer(groupOrderReducer, initialState);

  const setOrderInfo = (orderInfo: OrderInfo) => {
    dispatch({ type: 'SET_ORDER_INFO', payload: orderInfo });
  };

  const setSelectedServices = (services: ServiceSelection[]) => {
    dispatch({ type: 'SET_SELECTED_SERVICES', payload: services });
  };

  const setSelectedItems = (items: Record<string, number>) => {
    dispatch({ type: 'SET_SELECTED_ITEMS', payload: items });
  };

  const addGuest = (email: string) => {
    dispatch({ type: 'ADD_GUEST', payload: email });
  };

  const removeGuest = (email: string) => {
    dispatch({ type: 'REMOVE_GUEST', payload: email });
  };

  const setPaymentMethod = (method: string) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  };

  const setOrderType = (isGroup: boolean) => {
    dispatch({ type: 'SET_ORDER_TYPE', payload: isGroup });
  };

  const setAdditionalNotes = (notes: string) => {
    dispatch({ type: 'SET_ADDITIONAL_NOTES', payload: notes });
  };

  const addGuestOrder = (order: GuestOrder) => {
    dispatch({ type: 'ADD_GUEST_ORDER', payload: order });
  };

  const updateGuestOrder = (id: string, updates: Partial<GuestOrder>) => {
    dispatch({ type: 'UPDATE_GUEST_ORDER', payload: { id, updates } });
  };

  const setVendorDetails = (name: string, image: string) => {
    dispatch({ type: 'SET_VENDOR_DETAILS', payload: { name, image } });
  };

  const setCutoffTime = (time: Date) => {
    dispatch({ type: 'SET_CUTOFF_TIME', payload: time });
  };

  const resetOrder = () => {
    dispatch({ type: 'RESET_ORDER' });
  };

  const value: GroupOrderContextValue = {
    state,
    dispatch,
    setOrderInfo,
    setSelectedServices,
    setSelectedItems,
    addGuest,
    removeGuest,
    setPaymentMethod,
    setOrderType,
    setAdditionalNotes,
    addGuestOrder,
    updateGuestOrder,
    setVendorDetails,
    setCutoffTime,
    resetOrder
  };

  return (
    <GroupOrderContext.Provider value={value}>
      {children}
    </GroupOrderContext.Provider>
  );
};