export function getWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  // Normalize phone number (remove spaces, dashes, parentheses)
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  // Ensure country code 91 if not present
  const fullNumber = cleanNumber.startsWith('91')
    ? cleanNumber
    : cleanNumber.length === 10
    ? `91${cleanNumber}`
    : cleanNumber;

  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}

export function getGeneralInquiryWhatsAppUrl(phone: string): string {
  return getWhatsAppUrl(
    phone,
    'Hello Aditi Ortho, Physio & Pain Center. I would like to enquire about an appointment.'
  );
}

export function getConditionWhatsAppUrl(phone: string, conditionName: string): string {
  return getWhatsAppUrl(
    phone,
    `Hello Aditi Ortho, Physio & Pain Center. I would like to consult regarding ${conditionName}. Could you share available appointment times?`
  );
}

export function getBookingConfirmationWhatsAppUrl(
  phone: string,
  data: {
    bookingId: string;
    patientName: string;
    serviceName: string;
    date: string;
    timeSlot: string;
  }
): string {
  const msg = `Hello Aditi Ortho, Physio & Pain Center.\n\nI have booked an appointment online:\n• Booking ID: ${data.bookingId}\n• Patient Name: ${data.patientName}\n• Service: ${data.serviceName}\n• Date: ${data.date}\n• Time: ${data.timeSlot}\n\nPlease confirm my slot. Thank you!`;
  return getWhatsAppUrl(phone, msg);
}
