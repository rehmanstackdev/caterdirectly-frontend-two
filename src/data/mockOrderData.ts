
// Mock data for group order example
export const mockOrderItems = [
  {
    id: '1',
    name: 'Catering Package A',
    price: 25.99,
    quantity: 10,
    total: 259.90,
    image: ''
  },
  {
    id: '2',
    name: 'Dessert Platter',
    price: 15.99,
    quantity: 5,
    total: 79.95,
    image: ''
  },
];

export const mockGuestOrders = [
  {
    guestName: 'Alice Johnson',
    email: 'alice@example.com',
    status: 'confirmed',
    items: [
      { id: 'g1-1', name: 'Chicken Parmesan', price: 18.99, quantity: 1, image: '' },
      { id: 'g1-2', name: 'Caesar Salad', price: 8.99, quantity: 1, image: '' },
    ],
    total: 27.98,
  },
  {
    guestName: 'Bob Smith',
    email: 'bob@example.com',
    status: 'pending',
    items: [
      { id: 'g2-1', name: 'Vegetable Lasagna', price: 16.99, quantity: 1, image: '' },
      { id: 'g2-2', name: 'Garlic Bread', price: 4.99, quantity: 2, image: '' },
    ],
    total: 26.97,
  },
  {
    guestName: 'Carol Davis',
    email: 'carol@example.com',
    status: 'confirmed',
    items: [
      { id: 'g3-1', name: 'Grilled Salmon', price: 22.99, quantity: 1, image: '' },
      { id: 'g3-2', name: 'Side Salad', price: 5.99, quantity: 1, image: '' },
    ],
    total: 28.98,
  },
];
