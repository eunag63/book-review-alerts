'use client';

import { useState } from 'react';

export default function AdminNotFoundPage() {
  const handleNotClick = () => {
    window.location.href = '/admin/dashboard';
  };

  return (
    <div style={{ 
      color: '#fff',
      background: '#000',
      fontFamily: 'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
      height: '100vh',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div>
        <style dangerouslySetInnerHTML={{
          __html: 'body{color:#fff;background:#000;margin:0}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}'
        }} />
        <h1 
          className="next-error-h1" 
          style={{
            display: 'inline-block',
            margin: 0,
            marginRight: '20px',
            padding: '0 23px 0 0',
            fontSize: '24px',
            fontWeight: 500,
            verticalAlign: 'top',
            lineHeight: '49px'
          }}
        >
          404
        </h1>
        <div style={{
          display: 'inline-block',
          textAlign: 'left',
          lineHeight: '49px',
          height: '49px',
          verticalAlign: 'middle'
        }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '49px',
            margin: 0,
            padding: 0
          }}>
            This page could <span 
              style={{ cursor: 'pointer' }}
              onClick={handleNotClick}
            >not</span> be found.
          </h2>
        </div>
      </div>
    </div>
  );
}