import { useEffect, useRef, useState, type ReactNode } from 'react';

interface DeferredSectionProps {
  id: string;
  className?: string;
  children: ReactNode;
}

export function DeferredSection({ id, className, children }: DeferredSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setReady(true);
        observer.disconnect();
      }
    }, { rootMargin: '300px', threshold: 0 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div id={id} ref={ref} className={className}>{ready ? children : null}</div>;
}