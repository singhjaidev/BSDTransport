document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        // Revenue chart
        const revenueChartCtx = document.getElementById('revenueChart');
        if (revenueChartCtx) {
            const revenueChart = new Chart(revenueChartCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Revenue',
                        data: [12500, 14800, 16200, 15300, 18700, 28425],
                        backgroundColor: '#FFDE59',
                        borderColor: '#F5C400',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value;
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return '$' + context.parsed.y;
                                }
                            }
                        }
                    }
                }
            });

            // Update chart when filter changes
            const revenueChartFilter = document.getElementById('revenueChartFilter');
            if (revenueChartFilter) {
                revenueChartFilter.addEventListener('change', function() {
                    let newLabels, newData;
                    
                    switch (this.value) {
                        case 'week':
                            newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                            newData = [1200, 1500, 1800, 1600, 2200, 2600, 1900];
                            break;
                        case 'year':
                            newLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            newData = [12500, 14800, 16200, 15300, 18700, 28425, 22500, 24600, 26800, 27900, 29500, 32000];
                            break;
                        default: // month
                            newLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                            newData = [6500, 7200, 8300, 6425];
                    }
                    
                    revenueChart.data.labels = newLabels;
                    revenueChart.data.datasets[0].data = newData;
                    revenueChart.update();
                });
            }
        }

        // Vehicle type chart
        const vehicleTypeChartCtx = document.getElementById('vehicleTypeChart');
        if (vehicleTypeChartCtx) {
            const vehicleTypeChart = new Chart(vehicleTypeChartCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Economy', 'Standard', 'SUV', 'Luxury'],
                    datasets: [{
                        data: [35, 42, 15, 8],
                        backgroundColor: [
                            '#4CAF50', // Green
                            '#FFDE59', // Yellow
                            '#2196F3', // Blue
                            '#9C27B0'  // Purple
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.parsed + '%';
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // Table actions
    const tableActionBtns = document.querySelectorAll('.data-table .action-btn');
    
    tableActionBtns.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('aria-label');
            const row = this.closest('tr');
            const bookingId = row.querySelector('.id-link').textContent;
            
            if (action.includes('View')) {
                alert(`Viewing details for booking ${bookingId}`);
            } else if (action.includes('Edit')) {
                alert(`Editing booking ${bookingId}`);
            } else if (action.includes('Delete')) {
                if (confirm(`Are you sure you want to delete booking ${bookingId}?`)) {
                    // In a real app, this would send a delete request to the server
                    row.style.opacity = '0.5';
                    setTimeout(() => {
                        row.remove();
                    }, 500);
                }
            }
        });
    });

    // Chart download buttons
    const downloadBtns = document.querySelectorAll('.chart-actions .action-btn');
    
    downloadBtns.forEach(button => {
        button.addEventListener('click', function() {
            const chartContainer = this.closest('.chart-container');
            const chartTitle = chartContainer.querySelector('h2').textContent;
            
            alert(`Downloading ${chartTitle} chart...`);
        });
    });

    // Support tickets
    const ticketItems = document.querySelectorAll('.ticket-item');
    
    ticketItems.forEach(ticket => {
        ticket.addEventListener('click', function() {
            const ticketId = this.querySelector('.ticket-id').textContent;
            const ticketTitle = this.querySelector('h3 a').textContent;
            
            alert(`Opening ticket ${ticketId}: ${ticketTitle}`);
        });
    });
});
