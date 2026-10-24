export function generateGoogleCalendarUrl(event: {
  title: string;
  description: string;
  location: string;
  dateStr: string; // YYYY-MM-DD
  timeSlotStr: string; // e.g. "10:00 AM - 10:30 AM"
}): string {
  try {
    // Parse time slot
    const [startPart] = event.timeSlotStr.split('-');
    const [time, period] = (startPart || '10:00 AM').trim().split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let h = hours;
    if (period?.toUpperCase() === 'PM' && h < 12) h += 12;
    if (period?.toUpperCase() === 'AM' && h === 12) h = 0;

    const startDate = new Date(`${event.dateStr}T${String(h).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}:00`);
    const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // default 45 mins

    const formatCalDate = (d: Date) =>
      d.toISOString().replace(/-|:|\.\d+/g, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description,
      location: event.location,
      dates: `${formatCalDate(startDate)}/${formatCalDate(endDate)}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (e) {
    return 'https://calendar.google.com';
  }
}

export function downloadIcsFile(event: {
  title: string;
  description: string;
  location: string;
  dateStr: string;
  timeSlotStr: string;
  bookingId: string;
}) {
  const [startPart] = event.timeSlotStr.split('-');
  const [time, period] = (startPart || '10:00 AM').trim().split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let h = hours;
  if (period?.toUpperCase() === 'PM' && h < 12) h += 12;
  if (period?.toUpperCase() === 'AM' && h === 12) h = 0;

  const startDate = new Date(`${event.dateStr}T${String(h).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}:00`);
  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);

  const formatIcs = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aditi Ortho Physio Center//Appointment//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.bookingId}@aditiortho.com`,
    `DTSTAMP:${formatIcs(new Date())}`,
    `DTSTART:${formatIcs(startDate)}`,
    `DTEND:${formatIcs(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `AditiOrtho-Appointment-${event.bookingId}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
