let listaReservas = JSON.parse(localStorage.getItem("listaReservas")) || [];
let listaMesas = JSON.parse(localStorage.getItem("listaMesas")) || [];

// 🔹 Duración estimada por ocasión
const duracionOcasionHoras = {
  "Cumpleaños": 3,
  "Aniversario": 3,
  "Negocios": 2,
  "Cena Romántica": 2,
  "Otro": 2
};

// 🔹 Imágenes grandes por ocasión
const imagenesOcasion = {
  "Cumpleaños": "https://cdn-icons-png.flaticon.com/512/3081/3081871.png",
  "Aniversario": "https://cdn-icons-png.flaticon.com/512/826/826939.png",
  "Negocios": "https://cdn-icons-png.flaticon.com/512/2332/2332748.png",
  "Cena Romántica": "https://cdn-icons-png.flaticon.com/512/3081/3081873.png",
  "Otro": "https://cdn-icons-png.flaticon.com/512/2920/2920244.png"
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

    let imagenOcasion = reserva.ocasion ? imagenesOcasion[reserva.ocasion] || "" : "";

    div.innerHTML = `
      <div class="tarjeta-reserva">
        <div class="card-body">
          <h5 class="text-white">👤 ${reserva.nombreCliente}</h5>
          <p class="text-light">📅 ${reserva.fechaReserva} ⏰ ${reserva.horaReserva} - ${reserva.horaFin || ""}</p>
          <p class="text-light">👥 ${reserva.cantidadPersonas} personas</p>
          <p class="text-light">🍽️ Mesa: ${reserva.mesaSeleccionada}</p>
          ${reserva.ocasion ? `<p class="text-light">🎉 Ocasión: ${reserva.ocasion}</p>` : ""}
          ${imagenOcasion ? `<div class="text-center"><img src="${imagenOcasion}" alt="${reserva.ocasion}" style="width:100%; max-height:200px; object-fit:contain;" /></div>` : ""}
          ${reserva.notasReserva ? `<p class="text-light">📝 ${reserva.notasReserva}</p>` : ""}
          <p class="mb-3">Estado: <strong class="${estadoColor}">${reserva.estadoReserva}</strong></p>
          
          <div class="btn-group-actions">
            <button class="btn btn-success btn-sm" onclick="pagarReserva(${i})">💳 Pagar</button>
            <button class="btn btn-warning btn-sm" onclick="editarReserva(${i})">✏️ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="cancelarReserva(${i})">❌ Cancelar</button>
            <button class="btn btn-outline-danger btn-sm" onclick="eliminarReserva(${i})">🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(div);
  });
}

// 🔹 Procesar pago
function pagarReserva(i) {
  const reserva = listaReservas[i];
  if (reserva.estadoReserva === "Finalizada") {
    Swal.fire({ icon: 'info', title: 'Reserva ya pagada', text: 'Esta reserva ya está pagada y finalizada.', confirmButtonColor: '#3085d6' });
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
      if (mesa) mesa.estadoMesa = "disponible";

      localStorage.setItem("listaMesas", JSON.stringify(listaMesas));
      guardarListaReservas();
      mostrarReservas();

      Swal.fire({ icon: 'success', title: '¡Pago Procesado!', html: `<strong>${reserva.nombreCliente}</strong><br>Mesa ${reserva.mesaSeleccionada} liberada`, confirmButtonColor: '#28a745', timer: 3000, timerProgressBar: true });
    }
  });
}

// 🔹 Cancelar reserva
function cancelarReserva(i) {
  const reserva = listaReservas[i];
  if (reserva.estadoReserva === "Cancelada") {
    Swal.fire({ icon: 'info', title: 'Reserva ya cancelada', text: 'Esta reserva ya está cancelada.', confirmButtonColor: '#3085d6' });
    return;
  }
  if (reserva.estadoReserva === "Finalizada") {
    Swal.fire({ icon: 'warning', title: 'No se puede cancelar', text: 'No se puede cancelar una reserva ya finalizada y pagada.', confirmButtonColor: '#ffc107' });
    return;
  }

  Swal.fire({
    title: '❌ Cancelar Reserva',
    html: `
      <div class="text-start">
        <strong>Cliente:</strong> ${reserva.nombreCliente}<br>
        <strong>Mesa:</strong> ${reserva.mesaSeleccionada}<br>
        <strong>Fecha:</strong> ${reserva.fechaReserva}<br>
        <strong>Hora:</strong> ${reserva.horaReserva}
      </div>
      <br>
      <strong>¿Estás seguro de cancelar esta reserva?</strong>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: '🗑️ Sí, cancelar',
    cancelButtonText: 'No, mantener'
  }).then((result) => {
    if (result.isConfirmed) {
      listaReservas[i].estadoReserva = "Cancelada";

      let mesa = listaMesas.find(m => m.nombreMesa === reserva.mesaSeleccionada);
      if (mesa) mesa.estadoMesa = "disponible";

      localStorage.setItem("listaMesas", JSON.stringify(listaMesas));
      guardarListaReservas();
      mostrarReservas();

      Swal.fire({ icon: 'success', title: 'Reserva Cancelada', html: `<strong>${reserva.nombreCliente}</strong><br>Mesa ${reserva.mesaSeleccionada} liberada`, confirmButtonColor: '#dc3545', timer: 3000, timerProgressBar: true });
    }
  });
}

// 🔹 Eliminar reserva
function eliminarReserva(i) {
  Swal.fire({
    title: '🗑️ Eliminar Reserva',
    text: '¿Seguro que deseas eliminar esta reserva de forma permanente?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      listaReservas.splice(i, 1);
      guardarListaReservas();
      mostrarReservas();
      Swal.fire({ icon: 'success', title: 'Reserva eliminada', text: 'La reserva ha sido eliminada correctamente.', confirmButtonColor: '#28a745', timer: 2000, timerProgressBar: true });
    }
  });
}

// 🔹 Crear o actualizar reserva con reprogramación automática
document.getElementById("formularioReserva").addEventListener("submit", (e) => {
  e.preventDefault();

  const idx = document.getElementById("indiceReserva").value;
  const nombreCliente = document.getElementById("inputNombreCliente").value.trim();
  const fechaReserva = document.getElementById("inputFechaReserva").value;
  let horaReserva = document.getElementById("inputHoraReserva").value;
  const cantidadPersonas = parseInt(document.getElementById("inputCantidadPersonas").value, 10);
  const mesaSeleccionada = document.getElementById("selectMesaDisponible").value;
  const ocasion = document.getElementById("selectOcasión").value;
  const notasReserva = document.getElementById("inputNotasReserva").value.trim();
  const estadoReserva = document.getElementById("selectEstadoReserva").value;

  if (!nombreCliente || !fechaReserva || !horaReserva || !mesaSeleccionada) {
    Swal.fire({ icon: 'error', title: 'Campos incompletos', text: 'Todos los campos obligatorios deben estar completos.', confirmButtonColor: '#dc3545' });
    return;
  }
  
  if (isNaN(cantidadPersonas) || cantidadPersonas <= 0) {
    Swal.fire({ icon: 'error', title: 'Cantidad inválida', text: 'La cantidad de personas debe ser mayor a 0.', confirmButtonColor: '#dc3545' });
    return;
  }

  let mesaObj = listaMesas.find(m => m.nombreMesa === mesaSeleccionada);
  if (mesaObj && cantidadPersonas > mesaObj.capacidadMesa) {
    Swal.fire({ icon: 'error', title: 'Capacidad excedida', text: `La mesa ${mesaSeleccionada} solo admite ${mesaObj.capacidadMesa} personas.`, confirmButtonColor: '#dc3545' });
    return;
  }

  const duracionHoras = duracionOcasionHoras[ocasion] || 2;
  let inicioNueva = new Date(`${fechaReserva}T${horaReserva}`);
  let finNueva = new Date(inicioNueva.getTime() + duracionHoras * 60 * 60 * 1000);

  // Verificar solapamiento con otras reservas
  let reservasMesa = listaReservas.filter(r => 
    r.mesaSeleccionada === mesaSeleccionada && r.fechaReserva === fechaReserva && r.estadoReserva !== "Cancelada"
  );

  if (reservasMesa.length > 0) {
    let ultima = reservasMesa.reduce((a, b) => {
      let finA = new Date(`${a.fechaReserva}T${a.horaFin || a.horaReserva}`);
      let finB = new Date(`${b.fechaReserva}T${b.horaFin || b.horaReserva}`);
      return finA > finB ? a : b;
    });

    let finUltima = new Date(`${ultima.fechaReserva}T${ultima.horaFin || ultima.horaReserva}`);
    if (inicioNueva < finUltima) {
      inicioNueva = new Date(finUltima);
      finNueva = new Date(inicioNueva.getTime() + duracionHoras * 60 * 60 * 1000);
      horaReserva = inicioNueva.toISOString().substring(11, 16);

      Swal.fire({ icon: 'info', title: 'Reserva reprogramada', text: `La mesa estaba ocupada. Tu reserva fue agendada automáticamente a las ${horaReserva}.`, confirmButtonColor: '#3085d6' });
    }
  }

  const nuevaReserva = {
    nombreCliente,
    fechaReserva,
    horaReserva,
    cantidadPersonas,
    mesaSeleccionada,
    ocasion,
    notasReserva,
    estadoReserva,
    duracionHoras,
    horaFin: finNueva.toISOString().substring(11, 16)
  };

  if (idx) {
    listaReservas[idx] = { ...listaReservas[idx], ...nuevaReserva };
    Swal.fire({ icon: 'success', title: '¡Reserva actualizada!', text: `Reserva de ${nombreCliente} actualizada correctamente`, confirmButtonColor: '#28a745', timer: 2000, timerProgressBar: true });
  } else {
    listaReservas.push(nuevaReserva);
    Swal.fire({ icon: 'success', title: '¡Reserva creada!', text: `Nueva reserva para ${nombreCliente} creada exitosamente`, confirmButtonColor: '#28a745', timer: 2000, timerProgressBar: true });
  }

  guardarListaReservas();
  mostrarReservas();
  bootstrap.Modal.getInstance(document.getElementById("modalReserva")).hide();
});

// 🔹 Editar reserva
function editarReserva(i) {
  const reserva = listaReservas[i];

  document.getElementById("indiceReserva").value = i;
  document.getElementById("inputNombreCliente").value = reserva.nombreCliente;
  document.getElementById("inputFechaReserva").value = reserva.fechaReserva;
  document.getElementById("inputHoraReserva").value = reserva.horaReserva;
  document.getElementById("inputCantidadPersonas").value = reserva.cantidadPersonas;
  document.getElementById("selectOcasión").value = reserva.ocasion || "";
  document.getElementById("inputNotasReserva").value = reserva.notasReserva || "";
  document.getElementById("selectEstadoReserva").value = reserva.estadoReserva || "Pendiente";

  cargarMesasDisponibles();
  const select = document.getElementById("selectMesaDisponible");
  if (!Array.from(select.options).some(opt => opt.value === reserva.mesaSeleccionada)) {
    let option = document.createElement("option");
    option.value = reserva.mesaSeleccionada;
    option.textContent = reserva.mesaSeleccionada + " (actual)";
    select.appendChild(option);
  }
  select.value = reserva.mesaSeleccionada;

  new bootstrap.Modal(document.getElementById("modalReserva")).show();
}

// 🔹 Botón "Nueva Reserva"
document.getElementById("btnAgregarReserva").addEventListener("click", () => {
  document.getElementById("formularioReserva").reset();
  document.getElementById("indiceReserva").value = "";
  cargarMesasDisponibles();
  new bootstrap.Modal(document.getElementById("modalReserva")).show();
});

document.addEventListener("DOMContentLoaded", () => {
  mostrarReservas();
  document.getElementById("filtroFecha").addEventListener("change", mostrarReservas);
  document.getElementById("filtroEstado").addEventListener("change", mostrarReservas);

  const params = new URLSearchParams(window.location.search);
  const mesaPreseleccionada = params.get("mesa");

  if (mesaPreseleccionada) {
    document.getElementById("formularioReserva").reset();
    document.getElementById("indiceReserva").value = "";
    cargarMesasDisponibles();

    const select = document.getElementById("selectMesaDisponible");
    if (!Array.from(select.options).some(opt => opt.value === mesaPreseleccionada)) {
      let option = document.createElement("option");
      option.value = mesaPreseleccionada;
      option.textContent = mesaPreseleccionada + " (seleccionada)";
      select.appendChild(option);
    }
    select.value = mesaPreseleccionada;

    new bootstrap.Modal(document.getElementById("modalReserva")).show();
  }
});
