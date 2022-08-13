import validator from 'validator';

export default class Validators {
  /**
   * Check if the first name has a length longer than 1
   */
  static firstName(firstname: string): boolean {
    return firstname.length > 0;
  }

  /**
   * Check if the email is not null, there is an actual email being inputted and this email
   * address is of correct form
   */
  static email(email: string): boolean {
    return email === null || email === '' || validator.isEmail(email);
  }

  /**
   * Check if the new password is longer than 8 characters
   */
  static password(password: string): boolean {
    return password === null || validator.isStrongPassword(password);
  }

  /**
   * Check if passwords match (given that both have an input)
   */
  static confirmPassword(left: string, right: string) {
    return (
      left === null
      || right === null
      || (left === right && this.password(left))
    );
  }

  static pincode(pincode: { newPincode: string, confirmPincode:string }) {
    return (validator.isNumeric(pincode.newPincode ?? '0') && (
      pincode.newPincode === null || pincode.newPincode.length === 4));
  }

  /**
   * Check if both pincodes match if a pincode has been inputted
   */
  static confirmPincode(pincode: { newPincode: string, confirmPincode:string }) {
    return (
      pincode.confirmPincode === null
      || pincode.newPincode === null
      || pincode.newPincode === pincode.confirmPincode
    );
  }
}
