import React, { useEffect, useState } from 'react';

/**
 * Windows Fluent Reveal Highlight & Ambient Spotlight Cursor Engine
 * 
 * Features:
 * 1. Ambient Cursor Torch: A soft, minimal radial glow follows the cursor (stronger near center, faint outward).
 * 2. Proximity Reveal: As cursor approaches any card/button, the facing edge lights up subtly.
 * 3. Dynamic Brightness: The closer the cursor gets, the more intense the border specular glint becomes.
 * 4. Interior Spotlight: When cursor enters inside the card/button, an interactive spotlight tracks under the cursor.
 */
export const SpotlightCursor: React.FC = () => {
  const [isFinePointer, setIsFinePointer] = useState<boolean>(false);

  useEffect(() => {
    // Only activate on pointer:fine (mouse / trackpad) devices
    const mq = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mq.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches);
    };

    mq.addEventListener('change', handleMediaChange);

    if (!mq.matches) {
      return () => mq.removeEventListener('change', handleMediaChange);
    }

    let rafId: number | null = null;
    let lastX = -999;
    let lastY = -999;
    let isInsideWindow = false;

    const PROXIMITY_RADIUS = 260; // Max radius in px where cards begin to detect mouse
    const activeElements = new Set<HTMLElement>();

    const updateSpotlights = (cursorX: number, cursorY: number) => {
      // 1. Update global cursor coordinates on documentElement
      document.documentElement.style.setProperty('--cursor-x', `${cursorX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${cursorY}px`);
      document.documentElement.style.setProperty('--cursor-opacity', isInsideWindow ? '1' : '0');

      // 2. Query all interactive glass cards, buttons, and panels
      const targets = document.querySelectorAll<HTMLElement>(
        '.glass-card, .glass-btn, .glass-panel, .glass-pill, [data-spotlight]'
      );

      const currentlyNearby = new Set<HTMLElement>();

      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();

        // Skip off-screen elements for performance
        if (
          rect.bottom < -100 ||
          rect.top > window.innerHeight + 100 ||
          rect.right < -100 ||
          rect.left > window.innerWidth + 100
        ) {
          return;
        }

        // Calculate distance from cursor point to closest point on the rectangle
        const dx = Math.max(rect.left - cursorX, 0, cursorX - rect.right);
        const dy = Math.max(rect.top - cursorY, 0, cursorY - rect.bottom);
        const dist = Math.hypot(dx, dy);

        if (dist < PROXIMITY_RADIUS && isInsideWindow) {
          currentlyNearby.add(el);
          activeElements.add(el);

          // Quadratic falloff: closer = much higher brightness, smooth dropoff towards edges
          const linearProximity = 1 - dist / PROXIMITY_RADIUS;
          const proximity = Math.pow(linearProximity, 1.4);

          const isInside = dist === 0;
          const relX = cursorX - rect.left;
          const relY = cursorY - rect.top;

          el.style.setProperty('--mouse-x', `${relX.toFixed(1)}px`);
          el.style.setProperty('--mouse-y', `${relY.toFixed(1)}px`);
          el.style.setProperty('--proximity', proximity.toFixed(3));
          el.style.setProperty('--is-hovered', isInside ? '1' : '0');
        }
      });

      // 3. Reset any elements that moved out of proximity
      activeElements.forEach((el) => {
        if (!currentlyNearby.has(el)) {
          el.style.setProperty('--proximity', '0');
          el.style.setProperty('--is-hovered', '0');
          el.style.setProperty('--mouse-x', '-999px');
          el.style.setProperty('--mouse-y', '-999px');
          activeElements.delete(el);
        }
      });
    };

    const onPointerMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      isInsideWindow = true;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          updateSpotlights(lastX, lastY);
          rafId = null;
        });
      }
    };

    const onPointerLeave = () => {
      isInsideWindow = false;
      document.documentElement.style.setProperty('--cursor-opacity', '0');
      activeElements.forEach((el) => {
        el.style.setProperty('--proximity', '0');
        el.style.setProperty('--is-hovered', '0');
        el.style.setProperty('--mouse-x', '-999px');
        el.style.setProperty('--mouse-y', '-999px');
      });
      activeElements.clear();
    };

    const onPointerEnter = () => {
      isInsideWindow = true;
      document.documentElement.style.setProperty('--cursor-opacity', '1');
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);
    document.addEventListener('mouseenter', onPointerEnter);

    return () => {
      mq.removeEventListener('change', handleMediaChange);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
      document.removeEventListener('mouseenter', onPointerEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isFinePointer) return null;

  return (
    <>
      {/* Invisible/Subtle Ambient Mouse Cursor Halo (Soft light following cursor across viewport) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 w-[420px] h-[420px] rounded-full z-10 transition-opacity duration-300 ease-out"
        style={{
          transform: 'translate3d(calc(var(--cursor-x, -999px) - 50%), calc(var(--cursor-y, -999px) - 50%), 0)',
          background:
            'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 0.04) 25%, rgba(239, 68, 68, 0.015) 55%, transparent 70%)',
          opacity: 'var(--cursor-opacity, 0)',
          filter: 'blur(6px)',
          willChange: 'transform',
        }}
      />
    </>
  );
};
