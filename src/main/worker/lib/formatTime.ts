export const formatTime = () => {
  const date = new Date()
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}
