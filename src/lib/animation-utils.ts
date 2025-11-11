export const animationVariants = {
  fade: {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    enter: { x: 100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },
  zoom: {
    enter: { scale: 0.9, opacity: 0 },
    center: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
  },
  none: {
    enter: {},
    center: {},
    exit: {},
  },
};

export const animationDurations = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
};

export const paddingClasses = {
  tight: 'p-2',
  normal: 'p-4',
  spacious: 'p-6',
};

export const alignmentClasses = {
  top: 'items-start',
  center: 'items-center',
  bottom: 'items-end',
};

export interface NodeSettings {
  appearance?: {
    background?: string;
    padding: 'tight' | 'normal' | 'spacious';
    alignment: 'top' | 'center' | 'bottom';
  };
  animation?: {
    entrance: 'fade' | 'slide' | 'zoom' | 'none';
    exit: 'fade' | 'slide' | 'zoom' | 'none';
    duration: 'fast' | 'normal' | 'slow';
  };
  accessibility?: {
    screenReaderText?: string;
    highContrast: boolean;
    reducedMotion: boolean;
  };
  analytics?: {
    tags: string[];
    isCriticalPath: boolean;
  };
}

export const defaultNodeSettings: NodeSettings = {
  appearance: {
    background: undefined,
    padding: 'normal',
    alignment: 'center',
  },
  animation: {
    entrance: 'fade',
    exit: 'fade',
    duration: 'normal',
  },
  accessibility: {
    screenReaderText: undefined,
    highContrast: false,
    reducedMotion: false,
  },
  analytics: {
    tags: [],
    isCriticalPath: false,
  },
};
