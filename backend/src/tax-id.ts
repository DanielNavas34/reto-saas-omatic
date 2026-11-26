const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';
const CIF_CONTROL_LETTERS = 'JABCDEFGHI';
const CIF_DIGIT_ONLY = 'ABEH';
const CIF_LETTER_ONLY = 'NPQSW';

/** Official DNI, NIE, and CIF check. CIF includes the control digit, not only the shape. */
export function isValidSpanishTaxId(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const normalized = value.toUpperCase().trim();
  return isValidDniOrNie(normalized) || isValidCif(normalized);
}

function isValidDniOrNie(value: string): boolean {
  const dni = /^[0-9]{8}[A-Z]$/;
  const nie = /^[XYZ][0-9]{7}[A-Z]$/;
  if (!dni.test(value) && !nie.test(value)) {
    return false;
  }

  const letter = value[8];
  let digits = value.slice(0, 8);
  if (value[0] === 'X' || value[0] === 'Y' || value[0] === 'Z') {
    digits = digits.replace('X', '0').replace('Y', '1').replace('Z', '2');
  }

  const number = Number(digits);
  return letter === DNI_LETTERS[number % 23];
}

function isValidCif(value: string): boolean {
  const match = value.match(/^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/);
  if (!match) {
    return false;
  }

  const organization = match[1];
  const digits = match[2];
  const control = match[3];
  let sum = 0;

  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[index]);
    if (index % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    sum += digit;
  }

  const controlDigit = (10 - (sum % 10)) % 10;
  const controlLetter = CIF_CONTROL_LETTERS[controlDigit];
  const asDigit = String(controlDigit);

  if (CIF_DIGIT_ONLY.includes(organization)) {
    return control === asDigit;
  }
  if (CIF_LETTER_ONLY.includes(organization)) {
    return control === controlLetter;
  }
  return control === asDigit || control === controlLetter;
}
