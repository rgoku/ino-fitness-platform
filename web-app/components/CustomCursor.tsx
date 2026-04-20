'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const bigRef = useRef<HTMLDivElement>(null);
  const smallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    const big = bigRef.current;
    const small = smallRef.current;
    if (!big || !small) return;

    let mouseX = 0, mouseY = 0;
    let bigX = 0, bigY = 0;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      small.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    };

    const animate = () => {
      bigX += (mouseX - bigX) * 0.16;
      bigY += (mouseY - bigY) * 0.16;
      big.style.transform = `translate(${bigX}px, ${bigY}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animate);
    };

    const onEnter = () => big.classList.add('hovering');
    const onLeave = () => big.classList.remove('hovering');

    window.addEventListener('mousemove', onMove);
    animate();

    const attachHovers = () => {
      document.querySelectorAll('a, button, .hoverable').forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    attachHovers();

    const obs = new MutationObserver(() => attachHovers());
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={bigRef} className="cursor-ball-big" aria-hidden />
      <div ref={smallRef} className="cursor-ball-small" aria-hidden />
    </>
  );
}
