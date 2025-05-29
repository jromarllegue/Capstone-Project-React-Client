import convertTime from '../../dashboard/utils/convertTime';

export default function convertToReadable(date, length) {
    if (new Date(date).toString() === 'Invalid Date') {
        return 'Cannot be retrieved. Invalid date.';
    }
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const month = date.toLocaleString('default', { month: length });
    const year = date.getFullYear();
    const convert_time = convertTime(`${date.getHours()}:${date.getMinutes()}`);

    if (length === 'long') {
        return `${day}, ${month} ${year} ${convert_time}`;
    } else {
        return `${day}/${month}/${year} ${convert_time}`;
    }
}