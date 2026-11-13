import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { KeystrokeMachine } from '../showcase/KeystrokeMachine';
import { PackFlowMachine } from '../showcase/PackFlowMachine';
import { PrismSweepMachine } from '../showcase/PrismSweepMachine';
import { ChronoWaveMachine } from '../showcase/ChronoWaveMachine';

interface ShowcaseCarouselProps {
  reducedMotion: boolean;
}

const SHOWCASE_CARDS = [
  {
    id: 'command',
    index: '01',
    title: '⌘K Navigation',
    description:
      'Jump across any unit, spec point, or definition in milliseconds.',
    renderMachine: (reducedMotion: boolean) => (
      <KeystrokeMachine reducedMotion={reducedMotion} />
    ),
  },
  {
    id: 'compiler',
    index: '02',
    title: 'Custom Revision Packs',
    description:
      'Select exact specification statements and assemble one printable pack.',
    renderMachine: (reducedMotion: boolean) => (
      <PackFlowMachine reducedMotion={reducedMotion} />
    ),
  },
  {
    id: 'themes',
    index: '03',
    title: 'Adaptive Themes',
    description:
      'Switch seamlessly between Obsidian, Cream, Dune, and Classic.',
    renderMachine: (reducedMotion: boolean) => (
      <PrismSweepMachine reducedMotion={reducedMotion} />
    ),
  },
  {
    id: 'progress',
    index: '04',
    title: 'Local Progress Tracking',
    description:
      'Reading time, completed topics, and daily picks stored privately.',
    renderMachine: (reducedMotion: boolean) => (
      <ChronoWaveMachine reducedMotion={reducedMotion} />
    ),
  },
] as const;

export function ShowcaseCarousel({ reducedMotion }: ShowcaseCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const scrollToSlide = (index: number) => {
    const clamped = Math.max(0, Math.min(SHOWCASE_CARDS.length - 1, index));
    setActiveSlide(clamped);
    const track = trackRef.current;
    if (!track) return;
    const targetChild = track.children[clamped] as HTMLElement | undefined;
    if (!targetChild) return;
    track.scrollTo({
      left: targetChild.offsetLeft,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const children = Array.from(track.children) as HTMLElement[];
    if (children.length === 0) return;

    const currentScroll = track.scrollLeft;
    let closestIndex = 0;
    let minDiff = Infinity;
    children.forEach((child, idx) => {
      const diff = Math.abs(child.offsetLeft - currentScroll);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    if (closestIndex !== activeSlide) {
      setActiveSlide(closestIndex);
    }
  };

  return (
    <section
      id="showcase"
      className="relative border-t py-20 sm:py-28"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header with Prev/Next and Slide Counter */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p
              className="font-mono text-[11px] tracking-[0.16em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              MOTION &amp; CRAFT
            </p>
            <h2
              className="mt-2.5 text-balance font-semibold tracking-[-0.03em] leading-[1.08]"
              style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)' }}
            >
              Every interaction feels{' '}
              <span className="font-serif italic font-normal">effortless.</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              data-testid="showcase-counter"
              className="font-mono text-xs tabular-nums"
              style={{ color: 'var(--ink-muted)' }}
            >
              0{activeSlide + 1} / 0{SHOWCASE_CARDS.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous showcase card"
                onClick={() => scrollToSlide(activeSlide - 1)}
                disabled={activeSlide === 0}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-opacity disabled:opacity-35"
                style={{
                  borderColor: 'var(--border-strong)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--ink)',
                }}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next showcase card"
                onClick={() => scrollToSlide(activeSlide + 1)}
                disabled={activeSlide === SHOWCASE_CARDS.length - 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-opacity disabled:opacity-35"
                style={{
                  borderColor: 'var(--border-strong)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--ink)',
                }}
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Card Track */}
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          className="relative mt-10 flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar"
        >
          {SHOWCASE_CARDS.map((card) => (
            <article
              key={card.id}
              className="flex w-[86vw] sm:w-[340px] lg:w-[360px] shrink-0 snap-start flex-col justify-between rounded-2xl border p-4 sm:p-5"
              style={{
                backgroundColor: 'var(--surface-elevated)',
                borderColor: 'var(--border)',
              }}
            >
              {card.renderMachine(reducedMotion)}

              <div className="mt-5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold tracking-tight">
                    {card.title}
                  </h3>
                  <span
                    className="font-mono text-[11px] tabular-nums"
                    style={{ color: 'var(--ink-muted)' }}
                  >
                    {card.index}
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--ink-muted)' }}
                >
                  {card.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
