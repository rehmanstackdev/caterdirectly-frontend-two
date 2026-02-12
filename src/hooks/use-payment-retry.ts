import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface PaymentError {
  type: 'card_error' | 'validation_error' | 'processing_error' | 'network_error' | 'unknown_error';
  message: string;
  code?: string;
  retryable?: boolean;
}

interface UsePaymentRetryProps {
  maxRetries?: number;
  retryDelayMs?: number;
  onSuccess?: (result: any) => void;
  onFinalFailure?: (error: PaymentError) => void;
}

export const usePaymentRetry = ({
  maxRetries = 3,
  retryDelayMs = 1000,
  onSuccess,
  onFinalFailure
}: UsePaymentRetryProps = {}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<PaymentError | null>(null);

  // Classify error type
  const classifyError = useCallback((error: any): PaymentError => {
    if (!error) {
      return {
        type: 'unknown_error',
        message: 'An unknown error occurred',
        retryable: false
      };
    }

    // Stripe error classification
    if (error.type) {
      switch (error.type) {
        case 'card_error':
          return {
            type: 'card_error',
            message: error.message || 'Your card was declined',
            code: error.code,
            retryable: ['insufficient_funds', 'card_declined'].includes(error.code) ? false : true
          };
        case 'validation_error':
          return {
            type: 'validation_error',
            message: error.message || 'Please check your payment information',
            retryable: false
          };
        case 'api_connection_error':
        case 'api_error':
          return {
            type: 'network_error',
            message: 'Network error. Please check your connection and try again.',
            retryable: true
          };
        default:
          break;
      }
    }

    // Invoice already paid error (403) - should not retry
    if (error.message?.includes('already marked as paid') || 
        error.message?.includes('Invoice is already marked as paid') ||
        error.message?.includes('already paid')) {
      return {
        type: 'validation_error',
        message: error.message || 'Invoice is already marked as paid',
        retryable: false
      };
    }

    // Network/timeout errors
    if (error.message?.includes('network') || error.message?.includes('timeout')) {
      return {
        type: 'network_error',
        message: 'Network error. Please check your connection and try again.',
        retryable: true
      };
    }

    // Processing errors
    if (error.message?.includes('processing') || error.message?.includes('payment')) {
      return {
        type: 'processing_error',
        message: error.message || 'Payment processing failed. Please try again.',
        retryable: true
      };
    }

    // Default classification
    return {
      type: 'unknown_error',
      message: error.message || 'An unexpected error occurred',
      retryable: true
    };
  }, []);

  // Attempt payment with retry logic
  const attemptPayment = useCallback(async (paymentFn: () => Promise<any>) => {
    const executeAttempt = async (attemptNumber: number): Promise<any> => {
      try {
        const result = await paymentFn();
        
        // Validate result before declaring success
        if (!result || (typeof result === 'object' && !result.id && !result.orderId)) {
          throw new Error('Payment processing returned invalid result');
        }
        
        // Reset state on success
        setRetryCount(0);
        setLastError(null);
        setIsRetrying(false);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (error) {
        const classifiedError = classifyError(error);
        setLastError(classifiedError);
        
        console.error(`Payment attempt ${attemptNumber} failed:`, classifiedError);
        
        // Check if we should retry
        if (classifiedError.retryable && attemptNumber < maxRetries) {
          setRetryCount(attemptNumber);
          setIsRetrying(true);
          
          toast.error(`Payment failed: ${classifiedError.message}. Retrying in ${retryDelayMs / 1000} seconds...`);
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
          
          // Recursive retry
          return executeAttempt(attemptNumber + 1);
        } else {
          // Final failure
          setIsRetrying(false);
          
          const finalErrorMessage = attemptNumber >= maxRetries 
            ? `Payment failed after ${maxRetries} attempts: ${classifiedError.message}`
            : `Payment failed: ${classifiedError.message}`;
          
          toast.error(finalErrorMessage);
          
          if (onFinalFailure) {
            onFinalFailure(classifiedError);
          }
          
          throw classifiedError;
        }
      }
    };

    return executeAttempt(1);
  }, [maxRetries, retryDelayMs, onSuccess, onFinalFailure, classifyError]);

  // Manual retry function
  const retryPayment = useCallback(async (paymentFn: () => Promise<any>) => {
    if (retryCount >= maxRetries) {
      toast.error('Maximum retry attempts reached');
      return;
    }
    
    setIsRetrying(true);
    return attemptPayment(paymentFn);
  }, [retryCount, maxRetries, attemptPayment]);

  // Reset retry state
  const resetRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
  }, []);

  // Get user-friendly error message
  const getErrorMessage = useCallback((error: PaymentError) => {
    switch (error.type) {
      case 'card_error':
        return error.code === 'card_declined' 
          ? 'Your card was declined. Please try a different payment method.'
          : 'There was an issue with your card. Please check your information and try again.';
      case 'validation_error':
        return 'Please check your payment information and try again.';
      case 'network_error':
        return 'Network connection issue. Please check your internet and try again.';
      case 'processing_error':
        return 'Payment processing failed. Please wait a moment and try again.';
      default:
        return 'An unexpected error occurred. Please try again or contact support.';
    }
  }, []);

  return {
    attemptPayment,
    retryPayment,
    resetRetry,
    retryCount,
    isRetrying,
    lastError,
    canRetry: lastError?.retryable && retryCount < maxRetries,
    getErrorMessage
  };
};