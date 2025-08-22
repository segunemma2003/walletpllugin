import React from 'react';

interface WelcomeScreenProps {
  onNavigate: (screen: string) => void;
  onWalletCreated?: () => void;
  onWalletUnlocked?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: '🌐',
      title: 'Multi-Chain Support',
      description: 'Ethereum, Bitcoin, Solana, TRON, and more'
    },
    {
      icon: '🔒',
      title: 'Advanced Security',
      description: 'Hardware wallet support & encryption'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Instant transactions & real-time updates'
    },
    {
      icon: '🔐',
      title: 'Privacy First',
      description: 'Your keys, your crypto, your control'
    }
  ];

  return (
    <div 
      style={{
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        color: 'white'
      }}
    >
      {/* Header */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            margin: '0 auto 1.5rem'
          }}>
            <span style={{ fontSize: '2.5rem' }}>🔗</span>
          </div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            margin: '0 0 0.5rem 0'
          }}>
            PayCio Wallet
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            opacity: 0.9,
            margin: 0
          }}>
            Your gateway to the decentralized world
          </p>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '2rem'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1rem',
                borderRadius: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ 
                fontSize: '1.5rem', 
                marginBottom: '0.5rem' 
              }}>
                {feature.icon}
              </div>
              <h3 style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                marginBottom: '0.25rem',
                margin: '0 0 0.25rem 0'
              }}>
                {feature.title}
              </h3>
              <p style={{ 
                fontSize: '0.75rem', 
                opacity: 0.8,
                margin: 0
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '2rem' }}>
        <button
          onClick={() => onNavigate('create')}
          style={{
            width: '100%',
            background: 'white',
            color: '#667eea',
            fontWeight: '600',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '1rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <span>🔗</span>
          Create New Wallet
        </button>

        <button
          onClick={() => onNavigate('import')}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontWeight: '600',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <span>📥</span>
          Import Existing Wallet
        </button>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        paddingBottom: '1.5rem'
      }}>
        <p style={{ 
          fontSize: '0.75rem', 
          opacity: 0.7,
          margin: 0
        }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;