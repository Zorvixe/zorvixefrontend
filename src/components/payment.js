import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, CreditCard, Upload, Check, Calendar, DollarSign, FileText, QrCode, Trash2, XCircle } from 'lucide-react';
import './payment.css';

const Payment = () => {
  const { token } = useParams();
  const [paymentLink, setPaymentLink] = useState(null);
  const [linkLoading, setLinkLoading] = useState(true);

  const [file, setFile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const fileInputRef = useRef(null);
  const [linkActive, setLinkActive] = useState(false);
  const [loadingLink, setLoadingLink] = useState(true);
  const navigate = useNavigate();

  // Payment details (would normally come from props or context)
  const paymentDetails = {
    clientName: "D Vittal",
    projectName: "ShortenLink Website",
    clientId: "ZOR-214A12",
    amount: 5000,
    dueDate: "2025-07-20"
  };

  useEffect(() => {
    const fetchPaymentLink = async () => {
      try {
        setLinkLoading(true);
        const response = await fetch(
          'https://zorvixebackend.onrender.com/api/admin/payment-link/4vXcZpLmKjQ8aTyNfRbEoWg7HdUs29qT'
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setPaymentLink(data.paymentLink);
        } else {
          setPaymentLink(null);
        }
      } catch (error) {
        console.error('Error fetching payment link:', error);
        setPaymentLink(null);
      } finally {
        setLinkLoading(false);
      }
    };

    fetchPaymentLink();
  }, []);

  const togglePaymentLink = async (active) => {
    try {
      const response = await fetch(
        'https://zorvixebackend.onrender.com/api/admin/payment-link/4vXcZpLmKjQ8aTyNfRbEoWg7HdUs29qT',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active })
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setPaymentLink(data.paymentLink);
      } else {
        alert('Failed to update link status');
      }
    } catch (error) {
      console.error('Error toggling payment link:', error);
      alert('Error updating link status');
    }
  };

  useEffect(() => {
    const checkLinkStatus = async () => {
      try {
        const response = await fetch(
          `https://zorvixebackend.onrender.com/api/payment-link/${token}`
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setLinkActive(data.active);
        } else {
          setLinkActive(false);
        }
      } catch (error) {
        console.error('Error checking link status:', error);
        setLinkActive(false);
      } finally {
        setLoadingLink(false);
      }
    };

    checkLinkStatus();
  }, [token]);


  if (loadingLink) {
    return (
      <div className="payment-container links_status_loader">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking link status...</p>
        </div>
      </div>
    );
  }

  if (!linkActive) {
    return (
      <div className="container vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center border rounded shadow p-4" style={{ maxWidth: '450px', width: '100%' }}>
          <div className="text-danger mb-3">
            <XCircle size={48} />
          </div>
          <h2 className="mb-2">Payment Link Inactive</h2>
          <p className="text-muted mb-4">
            This payment link is currently inactive. Please contact support.
          </p>
          <button className="btn btn-outline-primary" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>

    );
  }





  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "sfdqoeq5");
    formData.append("cloud_name", "dsjcty43b");

    try {
      setImageLoading(true);
      const response = await fetch("https://api.cloudinary.com/v1_1/dsjcty43b/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return null;
    } finally {
      setImageLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (file) => {
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image (JPG, PNG) or PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('File size exceeds 5MB limit');
      return;
    }

    const imageUrl = await uploadImageToCloudinary(file);
    if (imageUrl) {
      setFile({
        name: file.name,
        size: file.size,
        type: file.type,
        url: imageUrl
      });
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Please upload a payment receipt before submitting');
      return;
    }

    try {
      const response = await fetch('https://zorvixebackend.onrender.com/api/payment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: paymentDetails.clientName,
          projectName: paymentDetails.projectName,
          clientId: paymentDetails.clientId,
          amount: paymentDetails.amount,
          dueDate: paymentDetails.dueDate,
          receiptUrl: file.url
        })
      });

      const data = await response.json();

      if (response.ok) {
        setReferenceId(data.referenceId);
        setIsSubmitted(true);
      } else {
        throw new Error('We’ve received your payment, but it’s still being verified. Please wait around 50 seconds before trying to upload your receipt again.');
      }
    } catch (error) {
      console.error('We’ve received your payment, but it’s still being verified. Please wait around 50 seconds before trying to upload your receipt again.');
      alert('We’ve received your payment, but it’s still being verified. Please wait around 50 seconds before trying to upload your receipt again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="payment-container">
        <div className="success-wrapper">
          <div className="success-card">
            <div className="success-icon">
              <Check size={48} />
            </div>
            <h2>Registration Submitted Successfully!</h2>
            <p>Your payment registration has been received and is being processed.</p>
            <div className="reference-info">
              <span>Reference ID: <strong>{referenceId}</strong></span>
            </div>
            <div className="next-steps">
              <h4>What happens next?</h4>
              <ul>
                <li>Payment verification within 2-4 hours</li>
                <li>Project coordinator assignment</li>
                <li>Initial consultation scheduling</li>
                <li>Project kickoff within 24-48 hours</li>
              </ul>
            </div>
            <button className="back-btn" onClick={() => navigate('/')}>
              Go to Home
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      {/* Header */}
      <div className="header">
        <img src="/assets/img/zorvixe_logo.png" alt="Zorvixe Logo" className="logo_payment" />
      </div>
      <div className="header-section">
        <div className="header-content">
          <Building2 size={32} className="header-icon" />
          <div>
            <h1>Project Registration</h1>
            <p>Complete your registration to begin your enterprise project</p>
          </div>
        </div>
        <div className="status-badge">
          <span>Registration Required</span>
        </div>
      </div>

      {/* Client Details Card */}
      <div className="card client-card">
        <div className="card-header">
          <div className="card-title">
            <Building2 size={20} />
            <span>Client Registration Details</span>
          </div>
          <div className="card-badge">Active</div>
        </div>
        <div className="card-content">
          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-icon">
                <FileText size={16} />
              </div>
              <div className="detail-content">
                <label>Client Name</label>
                <p>{paymentDetails.clientName}</p>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon">
                <FileText size={16} />
              </div>
              <div className="detail-content">
                <label>Project Name</label>
                <p>{paymentDetails.projectName}</p>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon">
                <Building2 size={16} />
              </div>
              <div className="detail-content">
                <label>Client ID</label>
                <p>{paymentDetails.clientId}</p>
              </div>
            </div>
            <div className="detail-item highlight-item">
              <div className="detail-icon">
                <DollarSign size={16} />
              </div>
              <div className="detail-content">
                <label>Registration Fee</label>
                <p className="amount">Rs. {paymentDetails.amount.toLocaleString()}</p>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon">
                <Calendar size={16} />
              </div>
              <div className="detail-content">
                <label>Due Date</label>
                <p>{new Date(paymentDetails.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Terms & Conditions Card */}
      <div className="card terms-card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={20} />
            <span>Terms & Conditions</span>
          </div>
        </div>
        <div className="card-content">
          <div className="terms-content">
            <div className="terms-list">
              <div className="term-item">
                <div className="term-number">01</div>
                <div className="term-text">
                  <strong>Payment Requirement:</strong> Project initiation requires full registration fee payment before development begins.
                </div>
              </div>
              <div className="term-item">
                <div className="term-number">02</div>
                <div className="term-text">
                  <strong>Non-Refundable:</strong> All payments are non-refundable once project development commences and resources are allocated.
                </div>
              </div>
              <div className="term-item">
                <div className="term-number">03</div>
                <div className="term-text">
                  <strong>Processing Time:</strong> Payment confirmation and verification may take 1-2 business days to complete.
                </div>
              </div>
              <div className="term-item">
                <div className="term-number">04</div>
                <div className="term-text">
                  <strong>Project Timeline:</strong> Delayed payments may result in project scheduling adjustments and delivery timeline changes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Methods Card */}
      <div className="card payment-methods-card">
        <div className="card-header">
          <div className="card-title">
            <CreditCard size={20} />
            <span>Payment Methods</span>
          </div>
        </div>
        <div className="card-content">
          <div className="payment-options">
            <div className="payment-option">
              <div className="option-header">
                <div className="option-icon bank-icon">
                  <Building2 size={24} />
                </div>
                <div className="option-info">
                  <h4>Wire Transfer</h4>
                  <p>Direct bank transfer - Most secure</p>
                </div>
              </div>
              <div className="bank-details">
                <div className="bank-info">
                  <div className="info-row">
                    <span className="label">Name:</span>
                    <span className="value">Golla Ekambaram</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Bank Name:</span>
                    <span className="value">ICICI BANK</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Account Number:</span>
                    <span className="value">005301550916</span>
                  </div>
                  <div className="info-row">
                    <span className="label">IFSC Code:</span>
                    <span className="value">ICIC0000053</span>
                  </div>
                  <div className="info-row">
                    <span className="label">ZORVIXE Code:</span>
                    <span className="value">ZOR458A</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-divider">
              <span>OR</span>
            </div>

            <div className="payment-option">
              <div className="option-header">
                <div className="option-icon qr-icon">
                  <QrCode size={24} />
                </div>
                <div className="option-info">
                  <h4>Digital Payment</h4>
                  <p>Instant payment via QR code</p>
                </div>
              </div>
              <div className="qr-section">
                <div className="qr-code">
                  <div className="qr-placeholder">
                    <img src='/assets/img/payment_qr.jpg' className='qr_code_image' alt="QR Code" />
                  </div>
                </div>
                <div className="qr-instructions">
                  <h5>Scan to Pay Rs. 5,000</h5>
                  <p>Use your mobile banking app or digital wallet</p>
                  <div className="supported-apps">
                    <span>Phonepe</span>
                    <span>Paytm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Receipt Card */}
      <div className="card upload-card">
        <div className="card-header">
          <div className="card-title">
            <Upload size={20} />
            <span>Payment Confirmation</span>
          </div>
          <div className="required-badge">Required</div>
        </div>
        <div className="card-content">
          <div className="upload-section">
            {file ? (
              <div className="file-uploaded">
                <div className="file-preview">
                  <div className="file-icon">
                    {file.type.includes('image') ? (
                      <img src={file.url} alt="Preview" className="file-preview-image" />
                    ) : (
                      <FileText size={32} />
                    )}
                  </div>
                  <div className="file-details">
                    <h4>{file.name}</h4>
                    <p>{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button
                    className="remove-file"
                    onClick={() => setFile(null)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="upload-success">
                  <Check size={16} />
                  <span>Receipt uploaded</span>
                </div>
              </div>
            ) : (
              <div
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-content">
                  {imageLoading ? (
                    <div className="upload-loading">
                      <div className="loading-spinner"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="upload-icon">
                        <Upload size={48} />
                      </div>
                      <h4>Upload Payment Receipt</h4>
                      <p>Drag and drop your payment screenshot or receipt here</p>
                      <input
                        type="file"
                        id="receipt-upload"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e.target.files[0])}
                        accept="image/*,.pdf"
                        hidden
                      />
                      <button
                        className="upload-btn"
                        onClick={() => fileInputRef.current.click()}
                      >
                        Choose File
                      </button>
                      <div className="file-requirements">
                        <span>Supports: JPG, PNG, PDF</span>
                        <span>Max size: 5MB</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Section */}
      <div className="card confirmation-card">
        <div className="card-content">
          <div className="confirmation-content">
            <div className="confirmation-text">
              <h3>Ready to Submit Registration</h3>
              <p>Your project coordinator will contact you within 24 hours of payment verification to begin your project development process.</p>
            </div>
            <button
              className="submit-button"
              onClick={() => {
                handleSubmit();
                togglePaymentLink(false);
              }}
              disabled={!file || imageLoading}
            >
              <Check size={20} />
              {imageLoading ? 'Processing...' : 'Submit Registration'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;