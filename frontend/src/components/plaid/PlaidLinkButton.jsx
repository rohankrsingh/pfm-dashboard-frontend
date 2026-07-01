import { useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

/**
 * Inner component — only mounts AFTER we have a valid link token.
 * This ensures usePlaidLink is only called once with a real token,
 * preventing the "Plaid script embedded more than once" error.
 */
function PlaidLinkInner({ linkToken, onSuccess, onExit, children }) {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        const result = await api.exchangePublicToken(public_token);
        const name = metadata?.institution?.name || 'your bank';
        toast.success(`Successfully connected ${name}`);
        if (onSuccess) onSuccess(result, metadata);
      } catch (err) {
        toast.error('Failed to securely link account. Please try again.');
      }
    },
    onExit: (error, metadata) => {
      if (error) {
        console.warn('[Plaid] Link exit with error:', error);
        if (error.error_code === 'INVALID_LINK_TOKEN') {
          toast.error('Session expired. Please try again.');
        }
      }
      if (onExit) onExit(error, metadata);
    },
    onEvent: (eventName) => {
      // Useful for analytics
      if (import.meta.env.DEV) console.log('[Plaid Event]', eventName);
    },
  });

  // Support render prop pattern (children as function)
  if (typeof children === 'function') {
    return children({ open, ready });
  }

  return (
    <Button
      onClick={open}
      disabled={!ready}
      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full h-10 px-5 cursor-pointer gap-2"
    >
      <Plus className="size-4" />
      Connect Bank
    </Button>
  );
}

/**
 * PlaidLinkButton
 * 
 * Fetches a fresh link token ON CLICK (not on mount) to avoid:
 * - Wasted API calls on pages where user never connects
 * - Expired tokens (link tokens expire in 4 hours)
 * - Multiple usePlaidLink instances (which embed Plaid script multiple times)
 * 
 * Usage:
 *   // Simple button:
 *   <PlaidLinkButton onLinked={refreshData} />
 *
 *   // Custom trigger via render prop:
 *   <PlaidLinkButton onLinked={refreshData}>
 *     {({ open, loading }) => (
 *       <button onClick={open} disabled={loading}>Connect</button>
 *     )}
 *   </PlaidLinkButton>
 */
export default function PlaidLinkButton({ onLinked, onExit, children, className }) {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = useCallback(async () => {
    // If we already have a valid token in this session, reuse it
    // (tokens last 4 hours — good enough for a session)
    if (linkToken) {
      // The inner component's open() will be called by its own ready state
      // We just need to re-render with the token present
      return;
    }

    setLoading(true);
    try {
      const { link_token } = await api.createLinkToken();
      setLinkToken(link_token);
    } catch (err) {
      toast.error('Could not initialize bank connection. Please try again.');
      console.error('[Plaid] Failed to create link token:', err);
    } finally {
      setLoading(false);
    }
  }, [linkToken]);

  const handleSuccess = useCallback((result, metadata) => {
    // Reset token so next open() gets a fresh one
    setLinkToken(null);
    if (onLinked) onLinked(result, metadata);
  }, [onLinked]);

  const handleExit = useCallback((error, metadata) => {
    // Reset token on exit — link tokens are single-use
    setLinkToken(null);
    if (onExit) onExit(error, metadata);
  }, [onExit]);

  // Once we have a token, render the inner component which calls usePlaidLink
  if (linkToken) {
    return (
      <PlaidLinkInner
        linkToken={linkToken}
        onSuccess={handleSuccess}
        onExit={handleExit}
      >
        {/* Auto-open Plaid Link as soon as it's ready */}
        {({ open, ready }) => {
          if (ready) {
            // Use setTimeout to let React finish rendering before opening
            setTimeout(() => open(), 0);
          }
          // While waiting for ready, show loading state
          if (typeof children === 'function') {
            return children({ open, loading: !ready });
          }
          return (
            <Button
              onClick={open}
              disabled={!ready}
              className={className || "bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full h-10 px-5 cursor-pointer gap-2"}
            >
              <Loader2 className="size-4 animate-spin" />
              Opening...
            </Button>
          );
        }}
      </PlaidLinkInner>
    );
  }

  // Default state — show the connect button
  if (typeof children === 'function') {
    return children({ open: handleOpen, loading });
  }

  return (
    <Button
      onClick={handleOpen}
      disabled={loading}
      className={className || "bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full h-10 px-5 cursor-pointer gap-2"}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Initializing...
        </>
      ) : (
        <>
          <Plus className="size-4" />
          Connect Bank
        </>
      )}
    </Button>
  );
}
