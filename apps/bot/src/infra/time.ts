type ZonedDateParts = {
  date: string;
  time: string;
};

export const getZonedDateParts = (
  date: Date,
  timeZone: string,
): ZonedDateParts => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const valueOf = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    date: `${valueOf('year')}-${valueOf('month')}-${valueOf('day')}`,
    time: `${valueOf('hour')}:${valueOf('minute')}`,
  };
};

export const isReminderDue = (
  date: Date,
  timeZone: string,
  scheduledTime: string,
) => {
  const zoned = getZonedDateParts(date, timeZone);
  return zoned.time === scheduledTime;
};
