
export const PAYMENT_METHODS = {
  HOST_PAYS: 'host-pays',
  GUESTS_PAY: 'guests-pay',
  SPLIT_EQUALLY: 'split-equally'
} as const;

export const PAYMENT_METHOD_MESSAGES = {
  [PAYMENT_METHODS.HOST_PAYS]: {
    message: 'You will be charged for all items when you confirm this order.',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100'
  },
  [PAYMENT_METHODS.GUESTS_PAY]: {
    message: 'Each guest will be charged for their own items.',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100'
  },
  [PAYMENT_METHODS.SPLIT_EQUALLY]: {
    message: 'The total will be split equally among all participants.',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100'
  }
};
