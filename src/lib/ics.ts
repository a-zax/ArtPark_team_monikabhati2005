interface CalendarEvent {
  title: string;
  description: string;
  start: Date;
  durationHours: number;
}

function formatUtcTimestamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

function escapeIcsValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function generateICS(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CogniSync//Onboarding Planner//EN',
    'CALSCALE:GREGORIAN',
  ];

  events.forEach((event, index) => {
    const end = new Date(event.start.getTime() + event.durationHours * 60 * 60 * 1000);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${formatUtcTimestamp(event.start)}-${index}@cognisync`);
    lines.push(`DTSTAMP:${formatUtcTimestamp(new Date())}`);
    lines.push(`DTSTART:${formatUtcTimestamp(event.start)}`);
    lines.push(`DTEND:${formatUtcTimestamp(end)}`);
    lines.push(`SUMMARY:${escapeIcsValue(`Onboarding: ${event.title}`)}`);
    lines.push(`DESCRIPTION:${escapeIcsValue(event.description)}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join('\n');
}

export function downloadICS(events: CalendarEvent[], filename = 'onboarding_schedule.ics') {
  const icsData = generateICS(events);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
