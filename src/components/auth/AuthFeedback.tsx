import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Mail, Clock, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthFeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Mail,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColorMap = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
};

export function AuthFeedback({ 
  type, 
  title, 
  message, 
  actions 
}: AuthFeedbackProps) {
  const Icon = iconMap[type];
  
  return (
    <Alert className={colorMap[type]}>
      <Icon className={`h-4 w-4 ${iconColorMap[type]}`} />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <strong>{title}:</strong> {message}
          </div>
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'outline'}
                  onClick={action.onClick}
                  className="h-8"
                >
                  {action.label}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              ))}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Predefined feedback components for common scenarios
export function EmailVerificationFeedback({ onResend }: { onResend?: () => void }) {
  return (
  <AuthFeedback
    type="info"
    title="Email Verification Required"
    message="Please check your inbox and click the verification link to activate your account."
    actions={onResend ? [{ label: 'Resend Email', onClick: onResend }] : undefined}
  />
  );
}

export function PasswordResetSentFeedback({ onBackToLogin }: { onBackToLogin: () => void }) {
  return (
  <AuthFeedback
    type="success"
    title="Password Reset Sent"
    message="We've sent a password reset link to your email address. Please check your inbox."
    actions={[{ label: 'Back to Login', onClick: onBackToLogin, variant: 'outline' }]}
  />
  );
}

export function AccountCreatedFeedback({ onGoToLogin }: { onGoToLogin: () => void }) {
  return (
  <AuthFeedback
    type="success"
    title="Account Created Successfully"
    message="Your account has been created. You can now sign in with your credentials."
    actions={[{ label: 'Go to Login', onClick: onGoToLogin }]}
  />
  );
}

export function VendorApplicationSubmittedFeedback({ onGoToLogin }: { onGoToLogin: () => void }) {
  return (
  <AuthFeedback
    type="success"
    title="Application Submitted"
    message="Your vendor application has been received and will be reviewed within 2-3 business days."
    actions={[{ label: 'Go to Vendor Login', onClick: onGoToLogin }]}
  />
  );
}