import React, { useState } from 'react';
import { useTradeWallet } from '../context/TradeWalletContext';

const Deposit = () => {
  const { balance, addBalance, addNotification } = useTradeWallet();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Direct transfer from your bank account',
      fee: 'Free',
      time: '1-3 business days',
      fields: ['bankName', 'accountNumber', 'routingNumber']
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Instant deposit with Visa or Mastercard',
      fee: '2.9%',
      time: 'Instant',
      fields: ['cardNumber', 'expiryDate', 'cvv']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🅿️',
      description: 'Quick and secure PayPal transfer',
      fee: '3.5%',
      time: 'Instant',
      fields: ['paypalEmail']
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: '₿',
      description: 'Deposit using Bitcoin, Ethereum, or USDT',
      fee: 'Network fees only',
      time: '10-60 minutes',
      fields: ['cryptoAddress']
    }
  ];

  const validateForm = () => {
    if (!selectedMethod) {
      addNotification('Please select a payment method', 'error');
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      addNotification('Please enter a valid amount greater than 0', 'error');
      return false;
    }

    if (parseFloat(amount) < 10) {
      addNotification('Minimum deposit amount is $10', 'error');
      return false;
    }

    if (parseFloat(amount) > 50000) {
      addNotification('Maximum deposit amount is $50,000', 'error');
      return false;
    }

    const method = paymentMethods.find(m => m.id === selectedMethod);
    
    if (selectedMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        addNotification('Please enter a valid 16-digit card number', 'error');
        return false;
      }
      if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        addNotification('Please enter expiry date in MM/YY format', 'error');
        return false;
      }
      if (!cvv || cvv.length !== 3) {
        addNotification('Please enter a valid 3-digit CVV', 'error');
        return false;
      }
    }

    if (selectedMethod === 'bank') {
      if (!bankName) {
        addNotification('Please enter bank name', 'error');
        return false;
      }
      if (!accountNumber || accountNumber.length < 8) {
        addNotification('Please enter a valid account number', 'error');
        return false;
      }
      if (!routingNumber || routingNumber.length !== 9) {
        addNotification('Please enter a valid 9-digit routing number', 'error');
        return false;
      }
    }

    if (selectedMethod === 'paypal' && !paypalEmail) {
      addNotification('Please enter your PayPal email', 'error');
      return false;
    }

    if (selectedMethod === 'crypto' && !cryptoAddress) {
      addNotification('Please enter your crypto wallet address', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      const depositAmount = parseFloat(amount);
      addBalance(depositAmount);
      
      const method = paymentMethods.find(m => m.id === selectedMethod);
      addNotification('success', `Successfully deposited $${depositAmount.toLocaleString()} via ${method.name}`);
      
      // Reset form
      setAmount('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setBankName('');
      setAccountNumber('');
      setRoutingNumber('');
      setPaypalEmail('');
      setCryptoAddress('');
      setSelectedMethod('');
      setIsProcessing(false);
    }, 2000);
  };

  const renderMethodFields = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <div className="form-fields">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength="19"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength="5"
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength="3"
                />
              </div>
            </div>
          </div>
        );

      case 'bank':
        return (
          <div className="form-fields">
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                placeholder="e.g., Chase, Bank of America"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                placeholder="Enter your account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                maxLength="17"
              />
            </div>
            <div className="form-group">
              <label>Routing Number</label>
              <input
                type="text"
                placeholder="9-digit routing number"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                maxLength="9"
              />
            </div>
          </div>
        );

      case 'paypal':
        return (
          <div className="form-fields">
            <div className="form-group">
              <label>PayPal Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
              />
            </div>
          </div>
        );

      case 'crypto':
        return (
          <div className="form-fields">
            <div className="form-group">
              <label>Crypto Wallet Address</label>
              <input
                type="text"
                placeholder="Enter your BTC, ETH, or USDT address"
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
              />
            </div>
            <div className="crypto-info">
              <p>⚠️ Send only BTC, ETH, or USDT to this address. Other cryptocurrencies may be permanently lost.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="deposit-page">
      <div className="page-header">
        <h1>💰 Deposit Funds</h1>
        <p>Add funds to your trading account</p>
      </div>

      <div className="deposit-grid">
        <div className="deposit-info">
          <div className="current-balance-card">
            <h3>Current Balance</h3>
            <div className="balance-amount">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="balance-note">Available for trading immediately</p>
          </div>

          <div className="security-badges">
            <div className="badge">
              <span>🔒</span> SSL Encrypted
            </div>
            <div className="badge">
              <span>✅</span> PCI Compliant
            </div>
            <div className="badge">
              <span>🛡️</span> Fraud Protected
            </div>
          </div>
        </div>

        <div className="deposit-form-container">
          <form onSubmit={handleSubmit} className="deposit-form">
            <h2>Select Payment Method</h2>
            
            <div className="payment-methods-grid">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="method-icon">{method.icon}</div>
                  <div className="method-info">
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                    <div className="method-details">
                      <span className="fee">Fee: {method.fee}</span>
                      <span className="time">{method.time}</span>
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="checkmark">✓</div>
                  )}
                </div>
              ))}
            </div>

            {selectedMethod && (
              <>
                <div className="amount-section">
                  <h2>Enter Amount</h2>
                  <div className="amount-input-group">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="10"
                      max="50000"
                      step="0.01"
                    />
                  </div>
                  <div className="quick-amounts">
                    <button type="button" onClick={() => setAmount('100')}>$100</button>
                    <button type="button" onClick={() => setAmount('500')}>$500</button>
                    <button type="button" onClick={() => setAmount('1000')}>$1,000</button>
                    <button type="button" onClick={() => setAmount('5000')}>$5,000</button>
                  </div>
                </div>

                {renderMethodFields()}

                <div className="deposit-summary">
                  <h3>Deposit Summary</h3>
                  <div className="summary-row">
                    <span>Amount:</span>
                    <span>${amount ? parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</span>
                  </div>
                  <div className="summary-row">
                    <span>Fee:</span>
                    <span>
                      {amount && selectedMethod === 'card' 
                        ? `$${(parseFloat(amount) * 0.029).toFixed(2)}`
                        : amount && selectedMethod === 'paypal'
                        ? `$${(parseFloat(amount) * 0.035).toFixed(2)}`
                        : '$0.00'}
                    </span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>
                      ${amount && selectedMethod === 'card'
                        ? (parseFloat(amount) * 1.029).toFixed(2)
                        : amount && selectedMethod === 'paypal'
                        ? (parseFloat(amount) * 1.035).toFixed(2)
                        : amount || '0.00'}
                    </span>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    `Deposit $${amount ? parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}`
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
