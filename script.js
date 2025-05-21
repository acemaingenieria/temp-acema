const API_KEY = "5be76f5c3710aa3bae33da5c1783231e";
let chart = null;

async function buscarClima() {
  const ciudad = document.getElementById("ciudadInput").value.trim();
  if (!ciudad) return alert("Por favor ingresa una ciudad.");

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad},CO&appid=${API_KEY}&units=metric&lang=es`;

  try {
    const res = await fetch(weatherUrl);
    const data = await res.json();

    if (data.cod !== 200) throw new Error(data.message);

    document.getElementById("nombreCiudad").textContent = `Clima en ${data.name}`;
    document.getElementById("temp").textContent = data.main.temp;
    document.getElementById("feels").textContent = data.main.feels_like;
    document.getElementById("humedad").textContent = data.main.humidity;
    document.getElementById("viento").textContent = data.wind.speed;

    const fechaUTC = new Date(data.dt * 1000);
    document.getElementById("fechaClima").textContent = fechaUTC.toLocaleString("es-CO", {
      timeZone: "America/Bogota",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    renderGraficoClima(data.main, data.wind.speed, data.name);
    obtenerIndiceUV(data.coord.lat, data.coord.lon);

    // Ocultar mensaje de bienvenida
    document.getElementById("mensajeBienvenida").style.display = "none";
    
    // Mostrar los datos del clima
    document.getElementById("dashboard").classList.remove("oculto");
    document.getElementById("contenedorPrincipal").classList.remove("centrado");
    document.getElementById("contenedorPrincipal").classList.add("container-expandido");

  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function obtenerIndiceUV(lat, lon) {
  const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  try {
    const res = await fetch(uvUrl);
    const uvData = await res.json();
    document.getElementById("uv").textContent = uvData.value ?? "No disponible";
  } catch {
    document.getElementById("uv").textContent = "No disponible";
  }
}

function eliminarBusqueda() {
  document.getElementById("dashboard").classList.add("oculto");
  document.getElementById("contenedorPrincipal").classList.remove("container-expandido");
  document.getElementById("contenedorPrincipal").classList.add("centrado");
  document.getElementById("ciudadInput").value = "";
  if (chart) chart.destroy();

  // Mostrar el mensaje de bienvenida nuevamente
  document.getElementById("mensajeBienvenida").style.display = "block";
}

function renderGraficoClima(main, viento, ciudad) {
  const ctx = document.getElementById("graficoTemperatura").getContext("2d");

  const datos = {
    "Temp. mínima (°C)": main.temp_min,
    "Temp. actual (°C)": main.temp,
    "Sensación térmica (°C)": main.feels_like,
    "Temp. máxima (°C)": main.temp_max,
    "Humedad (%)": main.humidity,
    "Viento (m/s)": viento
  };

  const etiquetas = Object.keys(datos);
  const valores = Object.values(datos);

  const colores = etiquetas.map(etiqueta => {
    if (etiqueta.includes("mín")) return "#4fc3f7";
    if (etiqueta.includes("máx")) return "#ef5350";
    if (etiqueta.includes("actual")) return "#2196f3";
    if (etiqueta.includes("Sensación")) return "#90caf9";
    if (etiqueta.includes("Humedad")) return "#81c784";
    if (etiqueta.includes("Viento")) return "#a1887f";
    return "#ccc";
  });

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: etiquetas,
      datasets: [{
        label: `Clima en ${ciudad}`,
        data: valores,
        backgroundColor: colores,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valores'
          }
        }
      }
    }
  });
}
