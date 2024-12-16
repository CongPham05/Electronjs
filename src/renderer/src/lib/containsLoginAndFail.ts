export function containsLoginAndFail(text) {
  const regex = /Login.*Fail|Fail.*Login/
  return regex.test(text)
}
