function validateAuth({signup,email,password,confirm,name=''}) {
  if (!String(email || '').trim()) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) return 'Enter a valid email address.';
  if (!password) return 'Enter your password.';
  if (signup && password.length < 8) return 'Password must be at least 8 characters.';
  if (signup && password !== confirm) return 'Passwords do not match.';
  if (signup && !name.trim()) return 'Enter your name.';
  return '';
}
module.exports = { validateAuth };
