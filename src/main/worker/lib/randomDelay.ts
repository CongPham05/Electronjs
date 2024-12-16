export function randomDelay() {
  const min = 500
  const max = 1000
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min
    setTimeout(resolve, delay)
  })
}
