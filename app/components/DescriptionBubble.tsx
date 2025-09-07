'use client';

import { useState, useEffect } from 'react';

interface DescriptionBubbleProps {
  registrationId: number;
}

export default function DescriptionBubble({ registrationId }: DescriptionBubbleProps) {
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDescription() {
      try {
        const response = await fetch(`/api/registration/${registrationId}`);
        const data = await response.json();
        
        if (response.ok && data.description) {
          setDescription(data.description);
        }
      } catch (error) {
        console.error('Failed to fetch description:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDescription();
  }, [registrationId]);

  if (loading || !description) return null;

  return (
    <div 
      className="relative mt-6 px-3 py-2 rounded-2xl font-bold"
      style={{ backgroundColor: '#80FD8F', color: 'black', fontSize: '14px' }}
    >
      <div 
        className="absolute w-0 h-0"
        style={{
          top: '-10px',
          left: '30px',
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: '10px solid #80FD8F'
        }}
      />
      {description}
    </div>
  );
}