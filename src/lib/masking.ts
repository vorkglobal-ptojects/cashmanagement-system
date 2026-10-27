/**
 * Mask confidential National Identity Card (NIC) number
 * e.g. "198512304567" -> "1985******67", "851234567V" -> "8512*****7V"
 */
export function maskNic(nic: string): string {
  if (!nic || nic.length < 5) return '******';
  return nic.slice(0, 4) + '******' + nic.slice(-2);
}

/**
 * Mask confidential bank account number
 * e.g. "8001928471" -> "******8471"
 */
export function maskBankAccount(accountNo: string): string {
  if (!accountNo || accountNo.length < 5) return '******';
  return '******' + accountNo.slice(-4);
}
