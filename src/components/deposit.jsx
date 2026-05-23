import React, { useState } from 'react';
import { useTradeWallet } from '../context/TradeWalletContext';

const Deposit = () => {
  const { wallet, addBalance, addNotification } = useTradeWallet();
  const balance = wallet?.balance ?? 0;
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
      description: 'Direct bank transfer',
      fee: 'Free',
      time: '1-3 business days'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Instant deposit with Visa or Mastercard',
      fee: '2.9%',
      time: 'Instant'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🅿️',
      description: 'Quick and secure PayPal transfer',
      fee: '3.5%',
      time: 'Instant'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: '₿',
      description: 'Deposit using Bitcoin, Ethereum, or USDT',
      fee: 'Network fees only',
      time: '10-60 minutes'
    }
  ];

  const formatUSD = (value) => {
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return '0.00';
    return parsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const validateEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

  const validateForm = () => {
    const parsedAmount = parseFloat(amount);

    if (!selectedMethod) {
      addNotification('Please select a payment method', 'error');
      return false;
    }

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      addNotification('Please enter a valid amount greater than 0', 'error');
      return false;
    }

    if (parsedAmount < 10) {
      addNotification('Minimum deposit amount is $10', 'error');
      return false;
    }

    if (parsedAmount > 50000) {
      addNotification('Maximum deposit amount is $50,000', 'error');
      return false;
    }

    if (selectedMethod === 'card') {
      const cleanedCard = cardNumber.replace(/\s+/g, '');
      if (!/^[0-9]{16}$/.test(cleanedCard)) {
        addNotification('Please enter a valid 16-digit card number', 'error');
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        addNotification('Please enter expiry date in MM/YY format', 'error');
        return false;
      }
      if (!/^[0-9]{3,4}$/.test(cvv)) {
        addNotification('Please enter a valid CVV', 'error');
        return false;
      }
    }

    if (selectedMethod === 'bank') {
      if (!bankName.trim()) {
        addNotification('Please enter your bank name', 'error');
        return false;
      }
      if (!/^[0-9]{8,17}$/.test(accountNumber)) {
        addNotification('Please enter a valid account number', 'error');
        return false;
      }
      if (!/^[0-9]{9}$/.test(routingNumber)) {
        addNotification('Please enter a valid 9-digit routing number', 'error');
        return false;
      }
    }

    if (selectedMethod === 'paypal' && !validateEmail(paypalEmail)) {
      addNotification('Please enter a valid PayPal email', 'error');
      return false;
    }

    if (selectedMethod === 'crypto' && cryptoAddress.trim().length < 15) {
      addNotification('Please enter a valid crypto wallet address', 'error');
      return false;
    }

    return true;
  };

  const clearFields = () => {
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

        setIsProcessing(true);
        setTimeout(() => {
      const parsedAmount = parseFloat(amount);
      addBalance(parsedAmount);
      const currentMethod = paymentMethods.find((method) => method.id === selectedMethod);
      addNotification(`Successfully deposited $${formatUSD(parsedAmount)} via ${currentMethod?.name || 'selected method'}`, 'success');
      clearFields();
      setIsProcessing(false);
        }, 1500);
  };

  const getFee = () => {
    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed)) return 0;
    if (selectedMethod === 'card') return parsed * 0.029;
    if (selectedMethod === 'paypal') return parsed * 0.035;
    return 0;
  };

  const renderMethodFields = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength="19"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength="5"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength="4"
                />
              </div>
            </div>
          </div>
        );
      case 'bank':
        return (
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="bankName">Bank Name</label>
              <input
                id="bankName"
                type="text"
                placeholder="e.g., Chase, Bank of America"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="accountNumber">Account Number</label>
              <input
                id="accountNumber"
                type="text"
                placeholder="Enter your account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                maxLength="17"
              />
            </div>
            <div className="form-group">
              <label htmlFor="routingNumber">Routing Number</label>
              <input
                id="routingNumber"
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
              <label htmlFor="paypalEmail">PayPal Email</label>
              <input
                id="paypalEmail"
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
              <label htmlFor="cryptoAddress">Crypto Wallet Address</label>
              <input
                id="cryptoAddress"
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
                <button
                  key={method.id}
                  type="button"
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
                  {selectedMethod === method.id && <div className="checkmark">✓</div>}
                </button>
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
                    <span>${formatUSD(amount)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Fee:</span>
                    <span>${formatUSD(getFee())}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>${formatUSD(parseFloat(amount || 0) + getFee())}</span>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    `Deposit $${formatUSD(amount)}`
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
