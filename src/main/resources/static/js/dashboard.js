const socket = new SockJS('/ws-streamly');
const stompClient = Stomp.over(socket);

// Chart Configuration
const ctx = document.getElementById('clickChart').getContext('2d');
const clickChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: '# of Clicks',
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: '#94a3b8' }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#94a3b8' }
            },
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#94a3b8' }
            }
        }
    }
});

// Click count map
const clickCounts = {};

stompClient.connect({}, function (frame) {
    console.log('Connected: ' + frame);
    stompClient.subscribe('/topic/clicks', function (message) {
        handleEvent(JSON.parse(message.body));
    });
}, function(error) {
    console.error('STOMP error ' + error);
});

function handleEvent(eventData) {
    // 1. Update List
    try {
        // Only parse if it came as a string inside the body, 
        // but often the message.body IS the stringified JSON. 
        // The eventData might be double escaped if we aren't careful, 
        // but let's assume standard JSON.
        
        // Add to UI List
        const list = document.getElementById('eventsList');
        const li = document.createElement('li');
        li.className = 'event-item';
        
        // Format timestamp
        const time = new Date(eventData.timestamp || Date.now()).toLocaleTimeString();
        
        li.innerHTML = `
            <div class="event-time">${time}</div>
            <div class="event-title">${eventData.title}</div>
        `;
        
        list.insertBefore(li, list.firstChild);
        
        // Keep list size manageable
        if (list.children.length > 20) {
            list.removeChild(list.lastChild);
        }

        // 2. Update Chart
        const title = eventData.title;
        if (clickCounts[title]) {
            clickCounts[title]++;
        } else {
            clickCounts[title] = 1;
        }

        // Update Chart Data
        clickChart.data.labels = Object.keys(clickCounts);
        clickChart.data.datasets[0].data = Object.values(clickCounts);
        clickChart.update();

    } catch (e) {
        console.error("Error handling event", e);
    }
}
