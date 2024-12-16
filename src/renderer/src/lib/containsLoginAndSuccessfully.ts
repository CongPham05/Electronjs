export function containsLoginAndSuccessfully(text: string) {
  const regex = /Login.*successfully|Done|Get|Soccer/
  return regex.test(text)
}
