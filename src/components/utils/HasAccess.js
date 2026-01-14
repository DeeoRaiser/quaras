export function hasAccess(user, modulo) {
  console.log(user)
  if (!user?.access) return false
  const accesos = user.access.split(",").map(a => a.trim().toLowerCase());
  return accesos.includes(modulo.toLowerCase())
}