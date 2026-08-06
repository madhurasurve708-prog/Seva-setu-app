import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every web page during static rendering (expo export).
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Link preloading for web fonts / resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Style tag to set font-display: swap on expo vector icons to eliminate layout shifts */}
        <style dangerouslySetInnerHTML={{ __html: fontDisplaySwapOverride }} />

        {/* ScrollViewStyleReset is required for ScrollView to work on web */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

const fontDisplaySwapOverride = `
  @font-face {
    font-family: 'MaterialCommunityIcons';
    font-display: swap;
  }
`;
