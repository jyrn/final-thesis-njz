import React from 'react'
import styles from './TermsModal.module.css'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  type: 'terms' | 'privacy'
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept, type }) => {
  if (!isOpen) return null

  const isTerms = type === 'terms'

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isTerms ? 'Terms and Conditions' : 'Privacy Policy'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {isTerms ? (
            <div className={styles.termsContent}>
              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing and using the PESO Job Portal, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>

              <h3>2. Use License</h3>
              <p>
                Permission is granted to temporarily use the PESO Job Portal for personal, non-commercial 
                transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>

              <h3>3. User Account</h3>
              <p>
                You are responsible for safeguarding the password and for maintaining the confidentiality 
                of your account. You agree not to disclose your password to any third party.
              </p>

              <h3>4. Job Matching Service</h3>
              <p>
                Our AI-powered job matching service uses OCR technology to extract information from your 
                resume. By uploading your resume, you consent to this automated processing.
              </p>

              <h3>5. Prohibited Uses</h3>
              <p>
                You may not use our service for any unlawful purpose or to solicit others to perform 
                unlawful acts. You may not transmit any worms or viruses or any code of a destructive nature.
              </p>

              <h3>6. Disclaimer</h3>
              <p>
                The information on this portal is provided on an 'as is' basis. To the fullest extent 
                permitted by law, PESO excludes all representations, warranties, conditions and terms.
              </p>

              <h3>7. Limitations</h3>
              <p>
                In no event shall PESO or its suppliers be liable for any damages arising out of the use 
                or inability to use the materials on the portal.
              </p>

              <h3>8. Governing Law</h3>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of 
                the Philippines.
              </p>
            </div>
          ) : (
            <div className={styles.privacyContent}>
              <h3>Information We Collect</h3>
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                upload your resume, or contact us for support.
              </p>

              <h3>Resume Processing</h3>
              <p>
                When you upload your resume, we use OCR (Optical Character Recognition) technology to 
                extract text and information for job matching purposes. This processing is automated 
                and helps match you with relevant job opportunities.
              </p>

              <h3>How We Use Your Information</h3>
              <ul>
                <li>To provide and maintain our job matching service</li>
                <li>To process your resume and match you with job opportunities</li>
                <li>To communicate with you about your account and job matches</li>
                <li>To improve our services and user experience</li>
              </ul>

              <h3>Information Sharing</h3>
              <p>
                We may share your information with potential employers when you apply for jobs through 
                our platform. We do not sell your personal information to third parties.
              </p>

              <h3>Data Security</h3>
              <p>
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h3>Your Rights</h3>
              <p>
                You have the right to access, update, or delete your personal information. You can 
                manage your account settings or contact us for assistance.
              </p>

              <h3>Cookies</h3>
              <p>
                We use cookies to enhance your experience on our platform. You can control cookie 
                settings through your browser preferences.
              </p>

              <h3>Contact Us</h3>
              <p>
                If you have questions about this Privacy Policy, please contact us at the PESO office 
                or through our support channels.
              </p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.acceptButton} onClick={onAccept}>
            {isTerms ? 'Accept Terms' : 'Accept Privacy Policy'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TermsModal
