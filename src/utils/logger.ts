// Production-safe logging utility with persistence monitoring

interface PersistenceMetrics {
  saves: number;
  failures: number;
  lastError: string | null;
  lastSave: number;
}

class PersistenceLogger {
  private metrics: PersistenceMetrics = {
    saves: 0,
    failures: 0,
    lastError: null,
    lastSave: 0
  };

  private shouldLog = process.env.NODE_ENV === 'development';

  log(message: string, ...args: any[]) {
    if (this.shouldLog) {
      console.log(message, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog) {
      console.error(message, ...args);
    }
    // Track persistence failures
    if (message.includes('persistence') || message.includes('save')) {
      this.metrics.failures++;
      this.metrics.lastError = message;
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog) {
      console.warn(message, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog) {
      console.info(message, ...args);
    }
  }

  // Persistence-specific logging methods
  persistenceSuccess(operation: string, duration: number, data?: any) {
    this.metrics.saves++;
    this.metrics.lastSave = Date.now();
    if (this.shouldLog) {
      console.log(`✅ Persistence Success [${operation}] - ${duration}ms`, data ? { size: JSON.stringify(data).length } : '');
    }
  }

  persistenceFailure(operation: string, error: Error, attempt: number, willRetry: boolean) {
    this.metrics.failures++;
    this.metrics.lastError = error.message;
    if (this.shouldLog) {
      console.error(`❌ Persistence Failure [${operation}] - Attempt ${attempt}`, {
        error: error.message,
        willRetry,
        stack: error.stack
      });
    }
  }

  persistenceRetry(operation: string, attempt: number, delay: number) {
    if (this.shouldLog) {
      console.warn(`🔄 Persistence Retry [${operation}] - Attempt ${attempt} in ${delay}ms`);
    }
  }

  dataValidation(operation: string, isValid: boolean, errors?: string[]) {
    if (this.shouldLog) {
      if (isValid) {
        console.log(`✅ Data Validation [${operation}] - Valid`);
      } else {
        console.error(`❌ Data Validation [${operation}] - Invalid`, errors);
      }
    }
  }

  dataRecovery(source: string, fallbackUsed: boolean, corruptionDetected: boolean) {
    if (this.shouldLog) {
      console.log(`🔧 Data Recovery [${source}]`, {
        fallbackUsed,
        corruptionDetected
      });
    }
  }

  getMetrics(): PersistenceMetrics {
    return { ...this.metrics };
  }

  resetMetrics() {
    this.metrics = {
      saves: 0,
      failures: 0,
      lastError: null,
      lastSave: 0
    };
  }
}

export const logger = new PersistenceLogger();