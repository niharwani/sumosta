'use client';

interface TrackerEvent {
  eventType: string;
  eventData: Record<string, unknown>;
  pageUrl:   string;
  sessionId: string;
  timestamp: number;
  referrer:  string;
}

class SumostaTracker {
  private sessionId: string;
  private queue: TrackerEvent[] = [];
  private criticalEvents = new Set(['purchase', 'add_to_cart', 'begin_checkout']);

  constructor() {
    this.sessionId = this.getOrCreateSession();
    this.setupPageView();
    this.setupScrollDepth();
    this.startFlushInterval();
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  track(eventType: string, data: Record<string, unknown> = {}) {
    this.queue.push({
      eventType,
      eventData: data,
      pageUrl:   typeof window !== 'undefined' ? window.location.pathname : '',
      sessionId: this.sessionId,
      timestamp: Date.now(),
      referrer:  typeof document !== 'undefined' ? document.referrer : '',
    });

    if (this.queue.length >= 5 || this.criticalEvents.has(eventType)) {
      this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0) return;
    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/analytics/event', {
        method:    'POST',
        headers:   { 'Content-Type': 'application/json' },
        body:      JSON.stringify({ events }),
        keepalive: true,
      });
    } catch {
      this.queue.unshift(...events);
    }
  }

  private getOrCreateSession(): string {
    if (typeof window === 'undefined') return 'ssr';
    const key = 'sumosta_session';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  }

  private setupPageView() {
    if (typeof window === 'undefined') return;
    this.track('page_view', { page: window.location.pathname });
  }

  private setupScrollDepth() {
    if (typeof window === 'undefined') return;
    const depths = new Set<number>();
    const checkpoints = [25, 50, 75, 100];

    const onScroll = () => {
      const pct = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100,
      );
      for (const cp of checkpoints) {
        if (pct >= cp && !depths.has(cp)) {
          depths.add(cp);
          this.track('scroll_depth', { depth: cp, page: window.location.pathname });
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  private startFlushInterval() {
    if (typeof window === 'undefined') return;
    setInterval(() => this.flush(), 10_000);
  }
}

export const tracker =
  typeof window !== 'undefined' ? new SumostaTracker() : null;
