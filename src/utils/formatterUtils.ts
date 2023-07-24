export function formatDateTime(date: Date): string {

    const daysOfWeek : Array<string> = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ]

    const day = date.getDate().toString();
    const month = date.getMonth().toString();
    const year = date.getFullYear().toString();
    const dayOfWeek = daysOfWeek[date.getDay()];

    return `${day}-${month}-${year} (${dayOfWeek})`;
}
