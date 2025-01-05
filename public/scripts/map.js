            const latitude = document.getElementById("lat").textContent
            const longitude  = document.getElementById("lon").textContent;
        
            const map = L.map('map').setView([latitude, longitude], 13);
        
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
            }).addTo(map);
        
            L.marker([latitude, longitude]).addTo(map)
              .bindPopup(`Координаты: ${latitude}, ${longitude}`)
              .openPopup();