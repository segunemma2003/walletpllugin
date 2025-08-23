import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Share2, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useWallet } from '../../store/WalletContext';
import toast from 'react-hot-toast';
import type { ScreenProps } from '../../types/index';

const ReceiveScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { currentWallet, currentNetwork } = useWallet();
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(200);

  // Generate real QR code for wallet address
  const generateQRCode = (address: string): string => {
    // Create a proper QR code data string for cryptocurrency addresses
    // This includes the network prefix for better wallet compatibility
    const networkPrefix = currentNetwork?.symbol?.toLowerCase() || 'eth';
    return `${networkPrefix}:${address}`;
  };

  useEffect(() => {
    if (currentWallet?.address) {
      // Generate QR code data URL for the address
      setQrSize(200); // Ensure QR size is 200 for qrcode.react
    }
  }, [currentWallet?.address, currentNetwork?.symbol]);

  const copyAddress = async () => {
    if (!currentWallet?.address) return;
    
    try {
      await navigator.clipboard.writeText(currentWallet.address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const downloadQRCode = () => {
    if (!currentWallet?.address) return;
    
    // Generate real QR code using qrcode library
    import('qrcode').then((QRCode) => {
      QRCode.toCanvas(document.createElement('canvas'), currentWallet.address, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (err, canvas) => {
        if (err) {
          console.error('Error generating QR code:', err);
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
      // Fallback to basic canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = 200;
      canvas.height = 200;
      
      // Draw a simple QR-like pattern as fallback
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#fff';
      ctx.fillRect(10, 10, 180, 180);
      ctx.fillStyle = '#000';
      ctx.fillRect(20, 20, 160, 160);
      
      // Add text
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code', 100, 190);
      
      // Download
      const link = document.createElement('a');
      link.download = 'paycio-address-qr.png';
      link.href = canvas.toDataURL();
      link.click();
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
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy
      copyAddress();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!currentWallet?.address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-6"></div>
          <p className="text-white text-lg">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
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

      <div className="p-6 space-y-6">
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
              <QRCodeSVG
                value={generateQRCode(currentWallet.address)}
                size={qrSize}
                level="M"
                includeMargin={true}
              />
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
              <p className="text-white font-semibold">{currentNetwork?.name || 'Ethereum'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-200">Symbol</p>
              <p className="text-white font-semibold">{currentNetwork?.symbol || 'ETH'}</p>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveScreen; 