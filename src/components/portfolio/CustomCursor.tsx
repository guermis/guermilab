import { useEffect, useRef, useState, useCallback } from 'react';

type CursorVariant = 'default' | 'hover' | 'play' | 'scrub' | 'drag';

interface CursorState {
  x: number;
  y: number;
  variant: CursorVariant;
  visible: boolean;
  label?: string;
}

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>({
    x: -100, y: -100, variant: 'default', visible: false,
  });
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  const animate = useCallback(() => {
    pos.current.x += (target.current.x - pos.current.x) * 0.15;
    pos.current.y += (target.current.y - pos.current.y) * 0.15;

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px)`;
    }
    if (ringRef.current) {
      ringRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Hide on touch devices
    if ('ontouchstart' in window) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      setState(s => ({ ...s, visible: true }));
    };

    const onLeave = () => setState(s => ({ ...s, visible: false }));
    const onEnter = () => setState(s => ({ ...s, visible: true }));

    // Detect interactive elements
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const interactive = el.closest('[data-cursor]');
      if (interactive) {
        const variant = (interactive.getAttribute('data-cursor') || 'hover') as CursorVariant;
        const label = interactive.getAttribute('data-cursor-label') || undefined;
        setState(s => ({ ...s, variant, label }));
      } else if (el.closest('a, button, [role="button"]')) {
        setState(s => ({ ...s, variant: 'hover', label: undefined }));
      } else {
        setState(s => ({ ...s, variant: 'default', label: undefined }));
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseover', onOver);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  if ('ontouchstart' in (typeof window !== 'undefined' ? window : {})) return null;

  const ringSize = state.variant === 'default' ? 32 : state.variant === 'hover' ? 48 : 64;
  const dotSize = state.variant === 'default' ? 6 : 4;
  const showLabel = state.variant === 'play' || state.variant === 'scrub' || state.variant === 'drag';

  return (
    <>
      <style>{`
        * { cursor: none !important; }
        @media (hover: none) { * { cursor: auto !important; } }
      `}</style>

      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: dotSize,
          height: dotSize,
          marginLeft: -dotSize / 2,
          marginTop: -dotSize / 2,
          borderRadius: '50%',
          backgroundColor: 'hsl(var(--primary))',
          opacity: state.visible ? 1 : 0,
          transition: 'width 0.3s, height 0.3s, opacity 0.3s, margin 0.3s',
          willChange: 'transform',
        }}
      />

      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] flex items-center justify-center"
        style={{
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          borderRadius: '50%',
          border: `1px solid hsl(var(--primary) / ${state.variant === 'default' ? '0.3' : '0.6'})`,
          backgroundColor: showLabel ? 'hsl(var(--primary) / 0.12)' : 'transparent',
          opacity: state.visible ? 1 : 0,
          transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1), height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s, margin 0.4s cubic-bezier(0.16,1,0.3,1), border 0.3s, background-color 0.3s',
          willChange: 'transform',
        }}
      >
        {showLabel && state.label && (
          <span
            className="text-[9px] tracking-[0.15em] uppercase font-body text-primary"
            style={{ transition: 'opacity 0.2s', opacity: state.visible ? 1 : 0 }}
          >
            {state.label}
          </span>
        )}
      </div>
    </>
  );
}
