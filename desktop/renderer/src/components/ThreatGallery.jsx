import React, { useEffect, useState } from 'react';
import { fetchThreats } from '../api/backendClient.js';

const fallbackGallery = [
  { id: 'impersonation', name: 'Impersonation', description: 'Synthetic media to mimic voice or face of executives.' },
  { id: 'social_engineering', name: 'Social Engineering', description: 'Crafted assets to manipulate employees or partners.' },
  { id: 'kyc_bypass', name: 'KYC Bypass', description: 'Spoofed biometrics to pass onboarding checks.' },
  { id: 'evidence_fabrication', name: 'Evidence Fabrication', description: 'Fake video/audio used in legal or HR disputes.' },
  { id: 'reputation_damage', name: 'Reputation Damage', description: 'Viral deepfakes aimed at public figures.' },
  { id: 'blackmail', name: 'Blackmail', description: 'Coercion with staged compromising content.' },
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
  const [threats, setThreats] = useState(fallbackGallery);

  useEffect(() => {
    let mounted = true;
    const loadThreats = async () => {
      try {
        const items = await fetchThreats();
        if (mounted && Array.isArray(items) && items.length > 0) {
          setThreats(items);
        }
      } catch (error) {
        console.error('Failed to load threat definitions', error);
      }
    };
    loadThreats();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section style={sectionStyle}>
      <h3>Threat Gallery</h3>
      <p style={{ color: '#94a3b8' }}>Reference scenarios to discuss with stakeholders during demos.</p>
      <div style={galleryStyle}>
        {threats.map((item) => (
          <article key={item.id || item.name} style={cardStyle}>
            <h4 style={{ margin: 0 }}>{item.name}</h4>
            <p style={{ color: '#cbd5f5' }}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
