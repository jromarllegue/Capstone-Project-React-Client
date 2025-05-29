export default async function checkTimeframe(open_time, close_time) {
  let date_now = '';

  try {
    date_now = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/server-date`, { method: 'GET' });
    date_now = new Date(await date_now.json().then(data => data.date));
  } catch (error) {
    console.error('Failed to fetch server time:', error);
    return false;
  }

  const date_utc = date_now.getTime() + (date_now.getTimezoneOffset() * 60000);

  const date_pht = new Date(date_utc + (3600000*8));
  const time_pht = date_pht.getHours() * 60 + date_pht.getMinutes();

  const [openHours, openMinutes] = open_time.split(':').map(Number);
  const [closeHours, closeMinutes] = close_time.split(':').map(Number);

  const openTimeMinutes = openHours * 60 + openMinutes;
  const closeTimeMinutes = closeHours * 60 + closeMinutes;

  return time_pht >= openTimeMinutes && time_pht < closeTimeMinutes;
}