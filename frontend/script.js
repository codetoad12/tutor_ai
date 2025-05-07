document.addEventListener('DOMContentLoaded', () => {
    const todayDateElement = document.getElementById('today-date');
    const datePicker = document.getElementById('date-picker');

    // Set today's date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    todayDateElement.textContent = formattedDate;

    // Set the date picker's default value to today
    const isoDate = today.toISOString().split('T')[0];
    datePicker.value = isoDate;
}); 