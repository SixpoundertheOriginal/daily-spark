
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const slideUp = {
  initial: { y: 10, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const slideDown = {
  initial: { y: -10, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.2, ease: 'easeOut' }
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const modalAnimation = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  content: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const getTaskPriorityAnimation = (priority: string) => {
  switch (priority) {
    case 'high':
      return { color: '#ec4899', pulseDelay: 0 };
    case 'medium':
      return { color: '#8b5cf6', pulseDelay: 0.2 };
    case 'low':
      return { color: '#60a5fa', pulseDelay: 0.3 };
    default:
      return { color: '#8b5cf6', pulseDelay: 0 };
  }
};
