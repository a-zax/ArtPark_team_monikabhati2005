interface CalendarEvent {
   title: string;
   description: string;
   start: Date;
   durationHours: number;
}

export function generateICS(events: CalendarEvent[]): string {
   let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SyncPath AI//Corporate Onboarding Module//EN\nCALSCALE:GREGORIAN\n";

   events.forEach((event) => {
      const end = new Date(event.start.getTime() + event.durationHours * 60 * 60 * 1000);
      
      const formatTime = (d: Date) => {
         return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      ics += "BEGIN:VEVENT\n";
      ics += `DTSTAMP:${formatTime(new Date())}\n`;
      ics += `DTSTART:${formatTime(event.start)}\n`;
      ics += `DTEND:${formatTime(end)}\n`;
      ics += `SUMMARY:Onboarding: ${event.title}\n`;
      ics += `DESCRIPTION:${event.description}\n`;
      ics += "END:VEVENT\n";
   });

   ics += "END:VCALENDAR";
   return ics;
}

export function downloadICS(events: CalendarEvent[], filename = "onboarding_schedule.ics") {
   const icsData = generateICS(events);
   const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
   const url = window.URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.setAttribute('download', filename);
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
}
