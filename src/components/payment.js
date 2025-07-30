"use client"

import { useState,useCallback, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Building2,
  CreditCard,
  Upload,
  Check,
  Calendar,
  DollarSign,
  FileText,
  QrCode,
  Trash2,
  XCircle,
  User,
  FolderOpen,
  Info,
} from "lucide-react"
import "./payment.css"

const Payment = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [clientDetails, setClientDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [referenceId, setReferenceId] = useState("")
  const fileInputRef = useRef(null)

 
 
const fetchClientDetails = useCallback(async () => {
  try {
    setLoading(true)
    const response = await fetch(`https://zorvixebackend.onrender.com/api/client-details/${token}`)
    const data = await response.json()

    if (response.ok && data.success) {
      setClientDetails(data.client)
    } else {
      console.error("Failed to fetch client details:", data.message)
      setClientDetails(null)
    }
  } catch (error) {
    console.error("Error fetching client details:", error)
    setClientDetails(null)
  } finally {
    setLoading(false)
  }
}, [token]) // token is a dependency of fetchClientDetails

useEffect(() => {
  fetchClientDetails()
}, [fetchClientDetails]) // now ESLint is happy


  // Loading state
  if (loading) {
    return (
      <div className="payment-container links_status_loader">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    )
  }

  // Error state - link inactive or expired
  if (!clientDetails) {
    return (
      <div className="container vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center border rounded shadow p-4" style={{ maxWidth: "450px", width: "100%" }}>
          <div className="text-danger mb-3">
            <XCircle size={48} />
          </div>
          <h2 className="mb-2">Payment Link Inactive</h2>
          <p className="text-muted mb-4">
            This payment link is inactive, expired, or not found. Please contact support for assistance.
          </p>
          <button className="btn btn-outline-primary" onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "sfdqoeq5")
    formData.append("cloud_name", "dsjcty43b")

    try {
      setImageLoading(true)
      const response = await fetch("https://api.cloudinary.com/v1_1/dsjcty43b/image/upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      return data.secure_url
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error)
      return null
    } finally {
      setImageLoading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = async (file) => {
    if (!file) return

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image (JPG, PNG) or PDF file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit")
      return
    }

    const imageUrl = await uploadImageToCloudinary(file)
    if (imageUrl) {
      setFile({
        name: file.name,
        size: file.size,
        type: file.type,
        url: imageUrl,
      })
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a payment receipt before submitting")
      return
    }

    try {
      const response = await fetch("https://zorvixebackend.onrender.com/api/payment/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: clientDetails.id,
          clientName: clientDetails.clientName,
          projectName: clientDetails.projectName,
          projectId: clientDetails.project_id,
          zorvixeId: clientDetails.zorvixe_id,
          amount: clientDetails.amount,
          dueDate: clientDetails.dueDate,
          receiptUrl: file.url,
          projectDescription: clientDetails.project_description,
          linkId: clientDetails.linkId,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setReferenceId(data.referenceId)
        setIsSubmitted(true)
      } else {
        throw new Error(data.message || "Failed to submit payment registration")
      }
    } catch (error) {
      console.error("Error submitting payment:", error)
      alert("Failed to submit payment registration. Please try again.")
    }
  }

  // Success state
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
              <span>
                Reference ID: <strong>{referenceId}</strong>
              </span>
            </div>
            <div className="client-summary">
              <h4>Registration Details:</h4>
              <div className="summary-grid">
                <div>
                  <strong>Client:</strong> {clientDetails.clientName}
                </div>
                <div>
                  <strong>Project:</strong> {clientDetails.projectName}
                </div>
                <div>
                  <strong>Project ID:</strong> {clientDetails.project_id}
                </div>
                <div>
                  <strong>Zorvixe ID:</strong> {clientDetails.zorvixe_id}
                </div>
                <div>
                  <strong>Amount:</strong> Rs. {clientDetails.amount?.toLocaleString()}
                </div>
              </div>
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
            <button className="back-btn" onClick={() => navigate("/")}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
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

      {/* Client Details Card - IMPROVED */}
      <div className="card client-card">
        <div className="card-header">
          <div className="card-title">
            <Building2 size={20} />
            <span>Client Registration Details</span>
          </div>
          <div className="card-badge">Active</div>
        </div>
        <div className="card-content">
          {/* Client Info Section */}
          <div className="client-info-section">
            <div className="client-avatar">
              <User size={32} />
            </div>
            <div className="client-main-info">
              <h3 className="client-name">{clientDetails.clientName}</h3>
              <p className="client-email">{clientDetails.email}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="details-grid-improved">
            {/* Project Information */}
            <div className="detail-section">
              <div className="section-header">
                <FolderOpen size={18} />
                <h4>Project Information</h4>
              </div>
              <div className="detail-items">
                <div className="detail-item-improved">
                  <div className="detail-label">Project Name</div>
                  <div className="detail-value">{clientDetails.projectName}</div>
                </div>
                <div className="detail-item-improved">
                  <div className="detail-label">Project ID</div>
                  <div className="detail-value project-id">{clientDetails.project_id}</div>
                </div>
                <div className="detail-item-improved">
                  <div className="detail-label">Zorvixe ID</div>
                  <div className="detail-value zorvixe-id">{clientDetails.zorvixe_id}</div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="detail-section">
              <div className="section-header">
                <DollarSign size={18} />
                <h4>Payment Information</h4>
              </div>
              <div className="detail-items">
                <div className="detail-item-improved highlight">
                  <div className="detail-label">Registration Fee</div>
                  <div className="detail-value amount-value">Rs. {clientDetails.amount?.toLocaleString()}</div>
                </div>
                <div className="detail-item-improved">
                  <div className="detail-label">Due Date</div>
                  <div className="detail-value due-date">
                    <Calendar size={14} />
                    {new Date(clientDetails.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Description */}
          {clientDetails.project_description && (
            <div className="project-description-section">
              <div className="section-header">
                <Info size={18} />
                <h4>Project Description</h4>
              </div>
              <div className="description-content">
                <p>{clientDetails.project_description}</p>
              </div>
            </div>
          )}
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
                  <strong>Payment Requirement:</strong> Project initiation requires full registration fee payment before
                  development begins.
                </div>
              </div>
              <div className="term-item">
                <div className="term-number">02</div>
                <div className="term-text">
                  <strong>Non-Refundable:</strong> All payments are non-refundable once project development commences
                  and resources are allocated.
                </div>
              </div>
              <div className="term-item">
                <div className="term-number">03</div>
                <div className="term-text">
                  <strong>Processing Time:</strong> Payment confirmation and verification may take 1-2 business days to
                  complete.
                </div>
              </div>
              <div className="term-item">
                <div className="term-number">04</div>
                <div className="term-text">
                  <strong>Project Timeline:</strong> Delayed payments may result in project scheduling adjustments and
                  delivery timeline changes.
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
                    <img src="/assets/img/payment_qr.jpg" className="qr_code_image" alt="QR Code" />
                  </div>
                </div>
                <div className="qr-instructions">
                  <h5>Scan to Pay Rs. {clientDetails.amount?.toLocaleString()}</h5>
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
                    {file.type.includes("image") ? (
                      <img src={file.url || "/placeholder.svg"} alt="Preview" className="file-preview-image" />
                    ) : (
                      <FileText size={32} />
                    )}
                  </div>
                  <div className="file-details">
                    <h4>{file.name}</h4>
                    <p>{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button className="remove-file" onClick={() => setFile(null)}>
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
                className={`upload-area ${dragActive ? "drag-active" : ""}`}
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
                      <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
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
              <p>
                Your project coordinator will contact you within 24 hours of payment verification to begin your project
                development process.
              </p>
            </div>
            <button className="submit-button" onClick={handleSubmit} disabled={!file || imageLoading}>
              <Check size={20} />
              {imageLoading ? "Processing..." : "Submit Registration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
