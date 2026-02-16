import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/" style={{ color: '#00d4ff', textDecoration: 'none', marginBottom: '24px', display: 'inline-block' }}>
          &larr; Back to Home
        </Link>

        <h1 style={{ color: '#00d4ff', marginBottom: '32px' }}>Privacy Policy</h1>

        <div style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

          <h2 style={{ color: '#00d4ff', marginTop: '32px' }}>1. Information We Collect</h2>
          <p>
            GGVIBE LIVE AI collects information you provide directly when using our service, including:
          </p>
          <ul>
            <li>Account information (email, name) when you sign in via Google OAuth</li>
            <li>Chat conversations and queries submitted to the AI assistant</li>
            <li>Usage data and analytics to improve our service</li>
          </ul>

          <h2 style={{ color: '#00d4ff', marginTop: '32px' }}>2. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and maintain the AI chat service</li>
            <li>Improve and personalize your experience</li>
            <li>Communicate with you about service updates</li>
            <li>Ensure security and prevent abuse</li>
          </ul>

          <h2 style={{ color: '#00d4ff', marginTop: '32px' }}>3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data.
            Your conversations are encrypted in transit and at rest.
          </p>

          <h2 style={{ color: '#00d4ff', marginTop: '32px' }}>4. Third-Party Services</h2>
          <p>
            We use Google OAuth for authentication and OpenAI for AI processing.
            These services have their own privacy policies that govern their use of your data.
          </p>

          <h2 style={{ color: '#00d4ff', marginTop: '32px' }}>5. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data
            by contacting us. You can also disconnect your Google account at any time.
          </p>

          <h2 style={{ color: '#00d4ff', marginTop: '32px' }}>6. Contact Us</h2>
          <p>
            For privacy-related inquiries, please contact us through the GGVIBE LIVE AI platform.
          </p>
        </div>
      </div>
    </main>
  )
}
