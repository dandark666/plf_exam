class SigmoidVisualizer {
    constructor() {
        this.sigmoidChart = null;
        this.classificationChart = null;
        this.currentData = null;
        
        this.initializeControls();
        this.loadDefaultData();
    }

    initializeControls() {
        // Configurar event listeners para los controles
        document.getElementById('shift').addEventListener('input', (e) => {
            document.getElementById('shift-value').textContent = e.target.value;
        });

        document.getElementById('steepness').addEventListener('input', (e) => {
            document.getElementById('steepness-value').textContent = e.target.value;
        });

        document.getElementById('update-btn').addEventListener('click', () => {
            this.updateChart();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetControls();
        });
    }

    async loadDefaultData() {
        try {
            const response = await fetch('/api/sigmoid/default/');
            const data = await response.json();
            this.currentData = data;
            this.createCharts(data);
        } catch (error) {
            console.error('Error loading default data:', error);
            this.showError('Error al cargar los datos iniciales');
        }
    }

    async updateChart() {
        const params = {
            x_min: parseFloat(document.getElementById('x_min').value),
            x_max: parseFloat(document.getElementById('x_max').value),
            shift: parseFloat(document.getElementById('shift').value),
            steepness: parseFloat(document.getElementById('steepness').value),
            num_points: 100
        };

        // Validación básica
        if (params.x_min >= params.x_max) {
            this.showError('X Mínimo debe ser menor que X Máximo');
            return;
        }

        try {
            const response = await fetch('/api/sigmoid/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();
            this.currentData = data;
            this.updateCharts(data);
            this.hideError();
        } catch (error) {
            console.error('Error updating chart:', error);
            this.showError('Error al actualizar el gráfico');
        }
    }

    resetControls() {
        document.getElementById('shift').value = 0;
        document.getElementById('steepness').value = 1;
        document.getElementById('x_min').value = -10;
        document.getElementById('x_max').value = 10;
        document.getElementById('shift-value').textContent = '0.0';
        document.getElementById('steepness-value').textContent = '1.0';
        
        this.loadDefaultData();
    }

    createCharts(data) {
        this.createSigmoidChart(data);
        this.createClassificationChart(data);
    }

    createSigmoidChart(data) {
        const ctx = document.getElementById('sigmoidChart').getContext('2d');
        
        if (this.sigmoidChart) {
            this.sigmoidChart.destroy();
        }
        
        this.sigmoidChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Función Sigmoidea',
                        data: data.x_values.map((x, i) => ({x: x, y: data.y_values[i]})),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Puntos de Datos',
                        data: data.random_points.x.map((x, i) => ({
                            x: x,
                            y: data.random_points.y[i]
                        })),
                        type: 'scatter',
                        backgroundColor: 'rgba(231, 76, 60, 0.7)',
                        borderColor: 'rgba(231, 76, 60, 1)',
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Función Sigmoidea y Distribución de Datos'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'X'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'f(X)'
                        },
                        min: 0,
                        max: 1
                    }
                }
            }
        });
    }

    createClassificationChart(data) {
        const ctx = document.getElementById('classificationChart').getContext('2d');
        
        if (this.classificationChart) {
            this.classificationChart.destroy();
        }
        
        // Separar puntos por clase
        const class0 = [];
        const class1 = [];
        
        data.random_points.x.forEach((x, i) => {
            const point = { x: x, y: data.random_points.y[i] };
            if (data.random_points.classes[i] === 0) {
                class0.push(point);
            } else {
                class1.push(point);
            }
        });

        this.classificationChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Clase 0 (Rojo)',
                        data: class0,
                        backgroundColor: 'rgba(231, 76, 60, 0.7)',
                        borderColor: 'rgba(231, 76, 60, 1)',
                        pointRadius: 5
                    },
                    {
                        label: 'Clase 1 (Azul)',
                        data: class1,
                        backgroundColor: 'rgba(52, 152, 219, 0.7)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        pointRadius: 5
                    },
                    {
                        label: 'Frontera de Decisión',
                        data: data.x_values.map(x => ({
                            x: x,
                            y: 0.5
                        })),
                        type: 'line',
                        borderColor: '#2ecc71',
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Separación de Clases usando Sigmoidea'
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'X'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Probabilidad'
                        },
                        min: 0,
                        max: 1
                    }
                }
            }
        });
    }

    updateCharts(data) {
        if (this.sigmoidChart) {
            this.sigmoidChart.data.datasets[0].data = data.x_values.map((x, i) => ({x: x, y: data.y_values[i]}));
            this.sigmoidChart.data.datasets[1].data = data.random_points.x.map((x, i) => ({
                x: x,
                y: data.random_points.y[i]
            }));
            this.sigmoidChart.update();
        }

        if (this.classificationChart) {
            // Actualizar datos de clasificación
            const class0 = [];
            const class1 = [];
            
            data.random_points.x.forEach((x, i) => {
                const point = { x: x, y: data.random_points.y[i] };
                if (data.random_points.classes[i] === 0) {
                    class0.push(point);
                } else {
                    class1.push(point);
                }
            });

            this.classificationChart.data.datasets[0].data = class0;
            this.classificationChart.data.datasets[1].data = class1;
            this.classificationChart.data.datasets[2].data = data.x_values.map(x => ({
                x: x,
                y: 0.5
            }));
            this.classificationChart.update();
        }
    }

    showError(message) {
        // Remover error anterior si existe
        this.hideError();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SigmoidVisualizer();
});