import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Share2, Download, QrCode } from 'lucide-react';
import { useWallet } from '../../store/WalletContext';
import toast from 'react-hot-toast';
import type { ScreenProps } from '../../types/index';

const ReceiveScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { currentWallet } = useWallet();
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Generate QR code for wallet address
  const generateQRCode = async (address: string): Promise<string> => {
    try {
      const QRCode = await import('qrcode');
      return await QRCode.toDataURL(address, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return '';
    }
  };

  useEffect(() => {
    if (currentWallet?.address) {
      generateQRCode(currentWallet.address).then(setQrCodeDataUrl);
    }
  }, [currentWallet?.address]);

  const copyAddress = async () => {
    if (!currentWallet?.address) return;
    
    try {
      await navigator.clipboard.writeText(currentWallet.address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy address');
    }
  };

  const downloadQRCode = () => {
    if (!currentWallet?.address) return;
    
    // Generate QR code using qrcode library
    import('qrcode').then((QRCode) => {
      const canvas = document.createElement('canvas');
      QRCode.toCanvas(canvas, currentWallet.address, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('Error generating QR code:', error);
          return;
        }
        
        // Download
        const link = document.createElement('a');
        link.download = 'paycio-address-qr.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }).catch((error) => {
      console.error('Failed to load QR code library:', error);
      toast.error('Failed to download QR code');
    });
  };

  const shareAddress = async () => {
    if (!currentWallet?.address) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PayCio Wallet Address',
          text: `My PayCio wallet address: ${currentWallet.address}`,
          url: `ethereum:${currentWallet.address}`
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy
      copyAddress();
    }
  };

  // Show loading state if wallet is not available
  if (!currentWallet) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-purple-200 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-xl font-bold text-white">Receive</h1>
          <div className="w-10"></div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-6"></div>
            <p className="text-white text-lg">Loading wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no address
  if (!currentWallet.address) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-purple-200 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-xl font-bold text-white">Receive</h1>
          <div className="w-10"></div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg mb-4">No wallet address available</p>
            <p className="text-gray-300 text-sm mb-4">Please create or import a wallet first</p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 border-b border-white/10"
      >
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-purple-200 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="text-xl font-bold text-white">Receive</h1>
        <div className="w-10"></div> {/* Spacer */}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* QR Code Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white mb-4">Your Address</h2>
            
            {/* QR Code */}
            <div className="bg-white rounded-xl p-4 inline-block mb-6">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  className="w-48 h-48"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                </div>
              )}
            </div>

            {/* Address Display */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
              <p className="text-sm text-purple-200 mb-2">Address</p>
              <p className="font-mono text-white break-all">{currentWallet.address}</p>
            </div>

            {/* Copy Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyAddress}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
            >
              {copied ? (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={shareAddress}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors"
          >
            <Share2 className="w-6 h-6 text-white mx-auto mb-2" />
            <span className="text-sm text-white">Share</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadQRCode}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors"
          >
            <Download className="w-6 h-6 text-white mx-auto mb-2" />
            <span className="text-sm text-white">Download QR</span>
          </motion.button>
        </div>

        {/* Network Info */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-200">Network</p>
              <p className="text-white font-semibold">Ethereum</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-200">Symbol</p>
              <p className="text-white font-semibold">ETH</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveScreen; 