import React, { useEffect } from 'react';

/**
 * Windows Fluent Reveal Highlight Engine (Minimal, Tight Proximity)
 * 
 * - Only activates when cursor is very close to an element (within 85px).
 * - Tight 70px border illumination radius.
 * - Zero full-screen ambient halos or milkiness.
 * - Perfectly dark, matte default state when mouse is away.
 */
export const SpotlightCursor: React.FC = () => {
  useEffect(() => {
    // Only activate on pointer:fine (mouse / trackpad) devices
    const mq = window.matchMedia('(pointer: fine)');
    if (!mq.matches) return;

    let rafId: number | null = null;
    let lastX = -999;
    let lastY = -999;
    let isInsideWindow = false;

    // Minimal, tight proximity zone (95px - slightly enhanced by 5-10%)
    const PROXIMITY_RADIUS = 95;
    const activeElements = new Set<HTMLElement>();

    const updateSpotlights = (cursorX: number, cursorY: number) => {
      document.documentElement.style.setProperty('--cursor-x', `${cursorX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${cursorY}px`);

      const targets = document.querySelectorAll<HTMLElement>(
        '.glass-card, .glass-btn, .glass-button, .glass-pill, [data-spotlight]'
      );

      const currentlyNearby = new Set<HTMLElement>();

      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();

        // Skip off-screen elements
        if (
          rect.bottom < -50 ||
          rect.top > window.innerHeight + 50 ||
          rect.right < -50 ||
          rect.left > window.innerWidth + 50
        ) {
          return;
        }

        // Distance from cursor to closest edge of bounding box
        const dx = Math.max(rect.left - cursorX, 0, cursorX - rect.right);
        const dy = Math.max(rect.top - cursorY, 0, cursorY - rect.bottom);
        const dist = Math.hypot(dx, dy);

        if (dist < PROXIMITY_RADIUS && isInsideWindow) {
          currentlyNearby.add(el);
          activeElements.add(el);

          // Tight, steep falloff (minimal far away, clean glint up close)
          const linearProximity = 1 - dist / PROXIMITY_RADIUS;
          const proximity = Math.pow(linearProximity, 1.8);

          const isInside = dist === 0;
          const relX = cursorX - rect.left;
          const relY = cursorY - rect.top;

          el.style.setProperty('--mouse-x', `${relX.toFixed(1)}px`);
          el.style.setProperty('--mouse-y', `${relY.toFixed(1)}px`);
          el.style.setProperty('--proximity', proximity.toFixed(3));
          el.style.setProperty('--is-hovered', isInside ? '1' : '0');
        }
      });

      // Reset elements that left the tight proximity zone
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
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);
    document.addEventListener('mouseenter', onPointerEnter);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
      document.removeEventListener('mouseenter', onPointerEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null; // No full-screen ambient floating orbs
};
