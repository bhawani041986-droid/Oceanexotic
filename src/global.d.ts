import * as React from 'react';

declare module 'react' {
  function cloneElement<P>(
    element: React.ReactElement<P>,
    props?: Partial<P> & React.Attributes & { className?: string; [key: string]: any },
    ...children: React.ReactNode[]
  ): React.ReactElement<P>;
}
