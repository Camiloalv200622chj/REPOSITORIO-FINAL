

let listaReservas = JSON.parse(localStorage.getItem("listaReservas")) || [];
let listaMesas = JSON.parse(localStorage.getItem("listaMesas")) || [];

const duracionOcasionHoras = {
  "Cumpleaños": 3,
  "Aniversario": 3,
  "Negocios": 2,
  "Cena Romántica": 2,
  "Otro": 2,
  "Graduación": 3,
  "Reunión Familiar": 3,
  "Fiesta Infantil": 4
};

const imagenesOcasion = {
  "Cumpleaños": "cumpleaños.jpg",
  "Aniversario": "aniversario.jpg",
  "Negocios": "negocios.jpg",
  "Cena Romántica": "cena.jpg",
  "Otro": "otro.jpg",
  "Graduación": "graduacion.jpg",
  "Reunión Familiar": "reunionfamiliar.jpg",
  "Fiesta Infantil": "fiesta infantil.jpg"
};

function guardarListaReservas() {
  localStorage.setItem("listaReservas", JSON.stringify(listaReservas));
}

function hayChoqueDeHorario(nueva, idxEditar = null) {
  return listaReservas.some((reserva, i) => {
    if (i === idxEditar) return false; 
    if (reserva.mesaSeleccionada !== nueva.mesaSeleccionada) return false;
    if (["Cancelada", "Finalizada"].includes(reserva.estadoReserva)) return false;

    const inicioExistente = new Date(`${reserva.fechaReserva}T${reserva.horaReserva}`);
    const finExistente = new Date(`${reserva.fechaReserva}T${reserva.horaFin}`);
    const inicioNueva = new Date(`${nueva.fechaReserva}T${nueva.horaReserva}`);
    const finNueva = new Date(`${nueva.fechaReserva}T${nueva.horaFin}`);

    return (inicioNueva < finExistente && finNueva > inicioExistente);
  });
}

function verificarReservasVencidas() {
  const ahora = new Date();

  listaReservas.forEach((reserva) => {
    if (reserva.estadoReserva === "Pendiente") {
      const fin = new Date(`${reserva.fechaReserva}T${reserva.horaFin}`);
      if (ahora >= fin) {
        reserva.estadoReserva = "Finalizada";
        let mesa = listaMesas.find(m => m.nombreMesa === reserva.mesaSeleccionada);
        if (mesa) mesa.estadoMesa = "disponible";
      }
    }
  });

  localStorage.setItem("listaMesas", JSON.stringify(listaMesas));
  guardarListaReservas();
  mostrarReservas();
}

setInterval(verificarReservasVencidas, 60000);

function cargarMesasDisponibles() {
  const select = document.getElementById("selectMesaDisponible");
  select.innerHTML = "";

  listaMesas.forEach(m => {
    let option = document.createElement("option");
    option.value = m.nombreMesa;
    option.textContent = `${m.nombreMesa} - Capacidad ${m.capacidadMesa}`;
    select.appendChild(option);
  });
}

function mostrarReservas() {
  const contenedor = document.getElementById("contenedorReservas");
  contenedor.innerHTML = "";

  listaReservas.forEach((reserva, i) => {
    let div = document.createElement("div");
    div.classList.add("col-md-4");

    let estadoColor = {
      "Pendiente": "text-warning",
      "Confirmada": "text-info",
      "Cancelada": "text-danger",
      "Finalizada": "text-success"
    }[reserva.estadoReserva] || "text-white";

    let imagenOcasion = reserva.ocasion ? imagenesOcasion[reserva.ocasion] || "" : "";

    div.innerHTML = `
      <div class="tarjeta-reserva">
        <div class="card-body">
          <h5 class="text-white">👤 ${reserva.nombreCliente}</h5>
          <p class="text-light">📅 ${reserva.fechaReserva} ⏰ ${reserva.horaReserva} - ${reserva.horaFin}</p>
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

function pagarReserva(i) {
  const reserva = listaReservas[i];
  if (reserva.estadoReserva === "Finalizada") return;

  listaReservas[i].estadoReserva = "Finalizada";
  let mesa = listaMesas.find(m => m.nombreMesa === reserva.mesaSeleccionada);
  if (mesa) mesa.estadoMesa = "disponible";

  localStorage.setItem("listaMesas", JSON.stringify(listaMesas));
  guardarListaReservas();
  mostrarReservas();
}

function cancelarReserva(i) {
  listaReservas[i].estadoReserva = "Cancelada";
  let mesa = listaMesas.find(m => m.nombreMesa === listaReservas[i].mesaSeleccionada);
  if (mesa) mesa.estadoMesa = "disponible";

  localStorage.setItem("listaMesas", JSON.stringify(listaMesas));
  guardarListaReservas();
  mostrarReservas();
}

function eliminarReserva(i) {
  listaReservas.splice(i, 1);
  guardarListaReservas();
  mostrarReservas();
}

document.getElementById("formularioReserva").addEventListener("submit", (e) => {
  e.preventDefault();

  const idx = document.getElementById("indiceReserva").value;
  const nombreCliente = document.getElementById("inputNombreCliente").value.trim();
  const fechaReserva = document.getElementById("inputFechaReserva").value;
  const horaReserva = document.getElementById("inputHoraReserva").value;
  const cantidadPersonas = parseInt(document.getElementById("inputCantidadPersonas").value, 10);
  const mesaSeleccionada = document.getElementById("selectMesaDisponible").value;
  const ocasion = document.getElementById("selectOcasión").value;
  const notasReserva = document.getElementById("inputNotasReserva").value.trim();

  const duracionHoras = duracionOcasionHoras[ocasion] || 2;
  let inicioNueva = new Date(`${fechaReserva}T${horaReserva}`);
  let finNueva = new Date(inicioNueva.getTime() + duracionHoras * 60 * 60 * 1000);

  const nuevaReserva = {
    nombreCliente,
    fechaReserva,
    horaReserva,
    cantidadPersonas,
    mesaSeleccionada,
    ocasion,
    notasReserva,
    estadoReserva: "Pendiente",
    duracionHoras,
    horaFin: finNueva.toTimeString().slice(0,5)
  };

  if (hayChoqueDeHorario(nuevaReserva, idx ? parseInt(idx) : null)) {
    Swal.fire({ icon: 'error', title: 'Horario no disponible', text: 'La mesa ya tiene otra reserva en ese horario.' });
    return;
  }

  if (idx) {
    listaReservas[idx] = { ...listaReservas[idx], ...nuevaReserva };
  } else {
    listaReservas.push(nuevaReserva);
    let mesa = listaMesas.find(m => m.nombreMesa === mesaSeleccionada);
    if (mesa) mesa.estadoMesa = "ocupada";
  }

  localStorage.setItem("listaMesas", JSON.stringify(listaMesas));
  guardarListaReservas();
  mostrarReservas();
  bootstrap.Modal.getInstance(document.getElementById("modalReserva")).hide();
});

function editarReserva(i) {
  const reserva = listaReservas[i];

  document.getElementById("indiceReserva").value = i;
  document.getElementById("inputNombreCliente").value = reserva.nombreCliente;
  document.getElementById("inputFechaReserva").value = reserva.fechaReserva;
  document.getElementById("inputHoraReserva").value = reserva.horaReserva;
  document.getElementById("inputCantidadPersonas").value = reserva.cantidadPersonas;
  document.getElementById("selectOcasión").value = reserva.ocasion || "";
  document.getElementById("inputNotasReserva").value = reserva.notasReserva || "";

  cargarMesasDisponibles();
  document.getElementById("selectMesaDisponible").value = reserva.mesaSeleccionada;

  new bootstrap.Modal(document.getElementById("modalReserva")).show();
}

document.getElementById("btnAgregarReserva").addEventListener("click", () => {
  document.getElementById("formularioReserva").reset();
  document.getElementById("indiceReserva").value = "";
  cargarMesasDisponibles();
  new bootstrap.Modal(document.getElementById("modalReserva")).show();
});

document.addEventListener("DOMContentLoaded", () => {
  mostrarReservas();
  verificarReservasVencidas();
});
