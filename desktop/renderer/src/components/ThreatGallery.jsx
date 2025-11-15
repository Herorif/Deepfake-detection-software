import React from 'react';

const gallery = [
  { title: 'Impersonation', description: 'Synthetic media to mimic voice or face of executives.' },
  { title: 'Social Engineering', description: 'Crafted assets to manipulate employees or partners.' },
  { title: 'KYC Bypass', description: 'Spoofed biometrics to pass onboarding checks.' },
  { title: 'Evidence Fabrication', description: 'Fake video/audio used in legal or HR disputes.' },
  { title: 'Reputation Damage', description: 'Viral deepfakes aimed at public figures.' },
  { title: 'Blackmail', description: 'Coercion with staged compromising content.' },
];

const sectionStyle = {
  marginTop: '2rem',
};

const cardStyle = {
  background: '#0b1120',
  borderRadius: '0.75rem',
  padding: '1rem',
  border: '1px solid #1d4ed8',
};

const galleryStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1rem',
};

export default function ThreatGallery() {
  return (
    <section style={sectionStyle}>
      <h3>Threat Gallery</h3>
      <p style={{ color: '#94a3b8' }}>Reference scenarios to discuss with stakeholders during demos.</p>
      <div style={galleryStyle}>
        {gallery.map((item) => (
          <article key={item.title} style={cardStyle}>
            <h4 style={{ margin: 0 }}>{item.title}</h4>
            <p style={{ color: '#cbd5f5' }}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

