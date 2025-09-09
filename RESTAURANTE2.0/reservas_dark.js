let listaReservas = JSON.parse(localStorage.getItem("listaReservas")) || [];
let listaMesas = JSON.parse(localStorage.getItem("listaMesas")) || [];

// 🔹 Diccionario de imágenes según la ocasión
const imagenesOcasion = {
  "Cumpleaños": "https://cdn-icons-png.flaticon.com/512/523/523442.png",
  "Aniversario": "https://cdn-icons-png.flaticon.com/512/833/833472.png",
  "Cena Romántica": "https://cdn-icons-png.flaticon.com/512/1869/1869692.png",
  "Reunión de Negocios": "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  "Despedida": "https://cdn-icons-png.flaticon.com/512/4370/4370153.png",
  "Graduación": "https://cdn-icons-png.flaticon.com/512/3135/3135773.png",
  "Boda": "https://cdn-icons-png.flaticon.com/512/869/869636.png",
  "Otro": "https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
};

function guardarListaReservas() {
  localStorage.setItem("listaReservas", JSON.stringify(listaReservas));
}

function cargarMesasDisponibles() {
  const select = document.getElementById("selectMesaDisponible");
  select.innerHTML = "";

  listaMesas
    .filter(m => m.estadoMesa === "disponible")
    .forEach(m => {
      let option = document.createElement("option");
      option.value = m.nombreMesa;
      option.textContent = `${m.nombreMesa} - Capacidad ${m.capacidadMesa}`;
      select.appendChild(option);
    });
}

function mostrarReservas() {
  const contenedor = document.getElementById("contenedorReservas");
  contenedor.innerHTML = "";

  const filtroFecha = document.getElementById("filtroFecha").value;
  const filtroEstado = document.getElementById("filtroEstado").value;

  let reservasFiltradas = listaReservas;

  if (filtroFecha) {
    reservasFiltradas = reservasFiltradas.filter(r => r.fechaReserva === filtroFecha);
  }

  if (filtroEstado) {
    reservasFiltradas = reservasFiltradas.filter(r => r.estadoReserva === filtroEstado);
  }

  if (reservasFiltradas.length === 0) {
    contenedor.innerHTML = `<p class="text-center text-white">No hay reservas registradas</p>`;
    return;
  }

  reservasFiltradas.forEach((reserva, i) => {
    let div = document.createElement("div");
    div.classList.add("col-md-4");

    let estadoColor = '';
    switch (reserva.estadoReserva) {
      case "Pendiente": estadoColor = 'text-warning'; break;
      case "Confirmada": estadoColor = 'text-info'; break;
      case "Cancelada": estadoColor = 'text-danger'; break;
      case "Finalizada": estadoColor = 'text-success'; break;
      default: estadoColor = 'text-white';
    }

    // 🔹 Imagen según la ocasión
    let imagenOcasion = reserva.ocasion && imagenesOcasion[reserva.ocasion] 
      ? `<img src="${imagenesOcasion[reserva.ocasion]}" alt="${reserva.ocasion}" class="img-fluid rounded mb-2" style="max-height:200px; object-fit:contain;">`
      : "";

    div.innerHTML = `
      <div class="tarjeta-reserva">
        <div class="card-body">
          <h5 class="text-white">👤 ${reserva.nombreCliente}</h5>
          <p class="text-light">📅 ${reserva.fechaReserva} ⏰ ${reserva.horaReserva}</p>
          <p class="text-light">👥 ${reserva.cantidadPersonas} personas</p>
          <p class="text-light">🍽️ Mesa: ${reserva.mesaSeleccionada}</p>
          ${reserva.ocasion ? `<p class="text-light">🎉 Ocasión: ${reserva.ocasion}</p>` : ""}
          ${imagenOcasion}
          ${reserva.notasReserva ? `<p class="text-light">📝 ${reserva.notasReserva}</p>` : ""}
          <p class="mb-3">Estado: <strong class="${estadoColor}">${reserva.estadoReserva}</strong></p>
          
          <div class="btn-group-actions">
            <button class="btn btn-success btn-sm" onclick="pagarReserva(${i})">💳 Pagar</button>
            <button class="btn btn-warning btn-sm" onclick="editarReserva(${i})">✏️ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="cancelarReserva(${i})">❌ Cancelar</button>
            <button class="btn btn-outline-light btn-sm" onclick="eliminarReserva(${i})">🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(div);
  });
}

function pagarReserva(i) {
  const reserva = listaReservas[i];
  
  if (reserva.estadoReserva === "Finalizada") {
    Swal.fire({
      icon: 'info',
      title: 'Reserva ya pagada',
      text: 'Esta reserva ya está pagada y finalizada.',
      confirmButtonColor: '#3085d6'
    });
    return;
  }
  
  Swal.fire({
    title: '💳 Confirmar Pago',
    html: `
      <div class="text-start">
        <strong>Cliente:</strong> ${reserva.nombreCliente}<br>
        <strong>Mesa:</strong> ${reserva.mesaSeleccionada}<br>
        <strong>Fecha:</strong> ${reserva.fechaReserva}<br>
        <strong>Hora:</strong> ${reserva.horaReserva}<br>
        <strong>Personas:</strong> ${reserva.cantidadPersonas}
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#d33',
    confirmButtonText: '💰 Procesar Pago',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      listaReservas[i].estadoReserva = "Finalizada";
      listaReservas[i].fechaPago = new Date().toISOString().split('T')[0];
      listaReservas[i].horaPago = new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});

      let mesa = listaMesas.find(m => m.nombreMesa === reserva.mesaSeleccionada);
      if (mesa) {
        mesa.estadoMesa = "disponible";
      }

      localStorage.setItem("listaMesas", JSON.stringify(listaMesas));
      guardarListaReservas();
      mostrarReservas();

      Swal.fire({
        icon: 'success',
        title: '¡Pago Procesado!',
        html: `<strong>${reserva.nombreCliente}</strong><br>Mesa ${reserva.mesaSeleccionada} liberada`,
        confirmButtonColor: '#28a745',
        timer: 3000,
        timerProgressBar: true
      });
    }
  });
}

function cancelarReserva(i) {
  const reserva = listaReservas[i];
  
  if (reserva.estadoReserva === "Cancelada") {
    Swal.fire({
      icon: 'info',
      title: 'Reserva ya cancelada',
      text: 'Esta reserva ya está cancelada.',
      confirmButtonColor: '#3085d6'
    });
    return;
  }
  
  if (reserva.estadoReserva === "Finalizada") {
    Swal.fire({
      icon: 'warning',
      title: 'No se puede cancelar',
      text: 'No se puede cancelar una reserva ya finalizada y pagada.',
      confirmButtonColor: '#ffc107'
    });
    return;
  }
  
  Swal.fire({
    title: '❌ Cancelar Reserva',
    html: `
      <div class="text-start">
        <strong>Cliente:</strong> ${reserva.nombreCliente}<br>
        <strong>Mesa:</stro

