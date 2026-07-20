import { apiRequest, USERNAME } from "./api";

export function saveContactMessage(message) {
  return apiRequest(`/contact-messages?username=${USERNAME}`, {
    method: "POST",
    body: JSON.stringify({
      ...message,
      source: "personal-portfolio",
      notificationStatus: "emailjs",
    }),
  }).catch(() => null);
}
