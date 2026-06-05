import { useEffect, useRef, useState } from 'react';

/**
 * Track page load performance
 */
export function usePageLoadTime(pageName) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigationTiming = performance.getEntriesByType('navigation')[0];
    
    if (navigationTiming) {
      const metrics = {
        pageName,
        loadTime: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
        domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart,
        firstPaint: 0,
        firstContentfulPaint: 0,
        timestamp: new Date().toISOString()
      };

      // Get paint timing
      const paintTimings = performance.getEntriesByType('paint');
      paintTimings.forEach(timing => {
        if (timing.name === 'first-paint') {
          metrics.firstPaint = timing.startTime;
        } else if (timing.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = timing.startTime;
        }
      });

      // Log metrics
      console.log('[Performance]', metrics);

      // TODO: Send to analytics service
      // sendToAnalytics('page_load', metrics);
    }
  }, [pageName]);
}

/**
 * Track API call performance
 */
export function useApiPerformance() {
  const trackApiCall = (endpoint, duration, status) => {
    const metrics = {
      endpoint,
      duration,
      status,
      timestamp: new Date().toISOString()
    };

    console.log('[API Performance]', metrics);

    // TODO: Send to analytics service
    // sendToAnalytics('api_call', metrics);
  };

  return { trackApiCall };
}

/**
 * Track component render performance
 */
export function useRenderPerformance(componentName) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const renderTime = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;

    if (renderTime > 16) { // More than 1 frame (60fps)
      console.warn(`[Render Performance] ${componentName} took ${renderTime}ms to render (render #${renderCountRef.current})`);
    }
  });

  return {
    renderCount: renderCountRef.current,
    lastRenderTime: lastRenderTimeRef.current
  };
}

/**
 * Track errors
 */
export function useErrorTracking() {
  const trackError = (error, errorInfo = {}) => {
    const errorData = {
      message: error.message || error.toString(),
      stack: error.stack,
      ...errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.error('[Error Tracking]', errorData);

    // TODO: Send to error tracking service
    // Sentry.captureException(error, { extra: errorInfo });
  };

  return { trackError };
}

/**
 * Track Core Web Vitals
 */
export function useCoreWebVitals() {
  const [vitals, setVitals] = useState({
    lcp: null, // Largest Contentful Paint
    fid: null, // First Input Delay
    cls: null  // Cumulative Layout Shift
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setVitals(prev => ({ ...prev, lcp: lastEntry.renderTime || lastEntry.loadTime }));
        console.log('[LCP]', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          setVitals(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
          console.log('[FID]', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            setVitals(prev => ({ ...prev, cls: clsValue }));
            console.log('[CLS]', clsValue);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  }, []);

  return vitals;
}

/**
 * Track bundle size
 */
export function useBundleMetrics() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const resources = performance.getEntriesByType('resource');
    
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      totalSize += size;

      if (resource.name.endsWith('.js')) {
        jsSize += size;
      } else if (resource.name.endsWith('.css')) {
        cssSize += size;
      }
    });

    const metrics = {
      totalSize: (totalSize / 1024).toFixed(2) + ' KB',
      jsSize: (jsSize / 1024).toFixed(2) + ' KB',
      cssSize: (cssSize / 1024).toFixed(2) + ' KB',
      resourceCount: resources.length
    };

    console.log('[Bundle Metrics]', metrics);
  }, []);
}
