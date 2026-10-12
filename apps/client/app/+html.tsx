import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0a080b" />
        <meta name="description" content="LaundraLens.ai reveals hidden financial networks through explainable transaction intelligence." />
        <title>LaundraLens.ai · TRACE Financial Intelligence</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `body { background: #0a080b; }` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
