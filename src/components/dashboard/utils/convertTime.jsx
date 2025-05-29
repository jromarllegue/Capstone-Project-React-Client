export default function convertTime (time) {
  const [hour, minutes] = time.split(':');
  const HH = (parseInt(hour) % 12 || 12) < 10 ? `0${parseInt(hour) % 12 || 12}` : parseInt(hour) % 12 || 12;
  const mm = parseInt(minutes) < 10 ? `0${parseInt(minutes)}` : minutes;
  const ampm = parseInt(hour) >= 12 ? 'PM' : 'AM';
  return `${HH}:${mm} ${ampm}`;    
}