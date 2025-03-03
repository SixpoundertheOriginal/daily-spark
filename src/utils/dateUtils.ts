
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const isToday = (dateString: string): boolean => {
  return dateString.includes('Today');
};

export const isTomorrow = (dateString: string): boolean => {
  return dateString.includes('Tomorrow');
};

export const isOverdue = (dateString: string): boolean => {
  return dateString.includes('Yesterday');
};

export const getGroupKey = (deadline: string): string => {
  if (isToday(deadline)) {
    return 'Today';
  } else if (isTomorrow(deadline)) {
    return 'Tomorrow';
  } else if (isOverdue(deadline)) {
    return 'Overdue';
  }
  return 'Later';
};

export const groupOrder = ['Overdue', 'Today', 'Tomorrow', 'Later'];
