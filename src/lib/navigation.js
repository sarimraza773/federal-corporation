export function safeStaffRedirect(path) {
  return typeof path === 'string'
    && path.startsWith('/staff/')
    && !path.startsWith('//')
    ? path
    : '/staff/articles';
}
