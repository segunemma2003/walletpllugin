import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { walletConnectManager, WalletConnectSession } from '../../utils/walletconnect-utils';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (session: WalletConnectSession) => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  onConnected
}) => {
  const [uri, setUri] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !uri) {
      initializeConnection();
    }
  }, [isOpen]);

  const initializeConnection = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const result = await walletConnectManager.connect();
      setUri(result.uri);
      
      if (result.session) {
        onConnected(result.session);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const copyToClipboard = async () => {
    if (uri) {
      try {
        await navigator.clipboard.writeText(uri);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URI:', err);
      }
    }
  };

  const openWalletConnect = () => {
    if (uri) {
      window.open(`wc:${uri}`, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {isConnecting ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing connection...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <p className="font-medium">Connection Failed</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={initializeConnection}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : uri ? (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <QRCodeSVG
                    value={uri}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center space-y-2">
                <p className="text-gray-700 font-medium">
                  Scan QR code with your mobile wallet
                </p>
                <p className="text-sm text-gray-500">
                  Or copy the connection link below
                </p>
              </div>

              {/* URI Display */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={uri}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                
                <button
                  onClick={openWalletConnect}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink size={16} />
                  <span>Open in Wallet</span>
                </button>
              </div>

              {/* Supported Wallets */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Supported Wallets:</p>
                <div className="flex justify-center space-x-4 text-xs text-gray-400">
                  <span>MetaMask</span>
                  <span>Trust Wallet</span>
                  <span>Rainbow</span>
                  <span>Argent</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}; 