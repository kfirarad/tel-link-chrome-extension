import parsePhoneNumber from 'libphonenumber-js';
import { createPopper } from '@popperjs/core';

function getLinkToService(service, phoneObject) {
  const phoneNumber = phoneObject.number;
  let href = '';
  switch (service) {
    case 'whatsapp':
      href = `https://wa.me/${phoneNumber}`;
      break;
    case 'signal':
      href = `https://signal.me/#p/${phoneNumber}`;
      break;
    case 'telegram':
      href = `https://t.me/${phoneNumber}`;
      break;
    default:
      return undefined;
  }

  const elm = document.createElement('a');
  elm.classList = `service-link ${service}-link`;
  elm.setAttribute('href', href);
  elm.setAttribute('target', '_blank');
  return elm;
}

const showEvents = ['mouseenter', 'focus'];
const hideEvents = ['mouseleave', 'blur'];

function createTooltipElement(phoneObject) {
  const tooltip = document.createElement('div');
  tooltip.append(getLinkToService('whatsapp', phoneObject));
  tooltip.append(getLinkToService('telegram', phoneObject));
  tooltip.append(getLinkToService('signal', phoneObject));
  tooltip.classList = 'tel-link-tooltip';

  const arrow = document.createElement('div');
  arrow.setAttribute('data-popper-arrow', '');
  arrow.classList = 'tel-link-tooltip-arrow';
  tooltip.append(arrow);
  return tooltip;
}

function detectRegionCodeFromHost() {
  const host = document.location.host;
  const stateCode = host.slice(host.lastIndexOf('.') + 1);
  if (stateCode.length === 2) {
    return stateCode;
  }
}

function detectRegionCodeFromLocale() {
  return Intl.NumberFormat()?.resolvedOptions()?.locale?.slice(-2);
}

function defaultRegionCode() {
  return 'IL';
}

function phoneNubmerDetection(phoneNumber) {
  let phoneObject = parsePhoneNumber(phoneNumber);
  if (!phoneObject || !phoneObject.isValid()) {
    phoneObject = parsePhoneNumber(phoneNumber, detectRegionCodeFromHost());
  }

  if (!phoneObject || !phoneObject.isValid()) {
    phoneObject = parsePhoneNumber(phoneNumber, detectRegionCodeFromLocale());
  }

  if (!phoneObject || !phoneObject.isValid()) {
    phoneObject = parsePhoneNumber(phoneNumber, defaultRegionCode());
  }
  return phoneObject;
}

document.querySelectorAll('a[href^=tel').forEach((element) => {
  const originalPhoneNumber = element.getAttribute('href').replace('tel:', '');
  const phoneObject = phoneNubmerDetection(originalPhoneNumber);
  if (phoneObject.isPossible()) {
    const tooltip = createTooltipElement(phoneObject);
    element.append(tooltip);
    const popperInstance = createPopper(element, tooltip, {
      placement: 'bottom',
    });

    showEvents.forEach((event) => {
      element.addEventListener(event, function show() {
        tooltip.setAttribute('data-show', '');

        // Enable the event listeners
        popperInstance.setOptions((options) => ({
          ...options,
          modifiers: [
            ...options.modifiers,
            { name: 'eventListeners', enabled: true },
          ],
        }));

        popperInstance.update();
      });
    });

    hideEvents.forEach((event) => {
      element.addEventListener(event, function hide() {
        tooltip.removeAttribute('data-show');
        // Disable the event listeners
        popperInstance.setOptions((options) => ({
          ...options,
          modifiers: [
            ...options.modifiers,
            { name: 'eventListeners', enabled: false },
          ],
        }));
      });
    });
  }
});
