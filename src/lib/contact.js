export const contactLimits = Object.freeze({
  name: Object.freeze({ min: 2, max: 100 }),
  email: Object.freeze({ max: 254 }),
  contactNumber: Object.freeze({ min: 7, max: 30 }),
  message: Object.freeze({ min: 10, max: 1800 }),
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactNumberPattern = /^\+?[0-9][0-9\s().-]*$/;

export function normalizeContactInput(input) {
  return {
    name: String(input.name || '').trim().replace(/\s+/g, ' '),
    email: String(input.email || '').trim().toLowerCase(),
    contactNumber: String(input.contactNumber || '').trim().replace(/\s+/g, ' '),
    message: String(input.message || '').replace(/\r\n?/g, '\n').trim(),
  };
}

export function validateContactInput(input) {
  const values = normalizeContactInput(input);
  const errors = {};

  if (!values.name) {
    errors.name = 'Please enter your name.';
  } else if (values.name.length < contactLimits.name.min) {
    errors.name = `Name must be at least ${contactLimits.name.min} characters.`;
  } else if (values.name.length > contactLimits.name.max) {
    errors.name = `Name must be ${contactLimits.name.max} characters or fewer.`;
  }

  if (!values.email) {
    errors.email = 'Please enter your email address.';
  } else if (values.email.length > contactLimits.email.max || !emailPattern.test(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.contactNumber) {
    errors.contactNumber = 'Please enter your contact number.';
  } else if (
    values.contactNumber.length < contactLimits.contactNumber.min
    || values.contactNumber.length > contactLimits.contactNumber.max
    || !contactNumberPattern.test(values.contactNumber)
  ) {
    errors.contactNumber = 'Please enter a valid contact number.';
  }

  if (!values.message) {
    errors.message = 'Please enter a message.';
  } else if (values.message.length < contactLimits.message.min) {
    errors.message = `Message must be at least ${contactLimits.message.min} characters.`;
  } else if (values.message.length > contactLimits.message.max) {
    errors.message = `Message must be ${contactLimits.message.max} characters or fewer.`;
  }

  return { values, errors };
}
