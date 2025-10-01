let listaReservas = JSON.parse(localStorage.getItem("listaReservas")) || [];
let listaMesas = JSON.parse(localStorage.getItem("listaMesas")) || [];

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

function mostrarAlerta(titulo, mensaje) {
  const label = document.getElementById("modalAlertaLabel");
  const body  = document.getElementById("modalAlertaMensaje");
  const modal = document.getElementById("modalAlerta");
  if (label) label.textContent = titulo || "Aviso";
  if (body)  body.textContent  = mensaje || "";
  if (modal && window.bootstrap?.Modal) new bootstrap.Modal(modal).show();
}

function hayChoqueDeHorario(nueva, idxEditar = null) {
  return listaReservas.some((reserva, i) => {
    if (i === idxEditar) return false; 
    if (reserva.mesaSeleccionada !== nueva.mesaSeleccionada) return false;
    if (["Cancelada", "Finalizada"].includes(reserva.estadoReserva)) return false;

    const inicioExistente = new Date(`${reserva.fechaReserva}T${reserva.horaReserva}`);
    const finExistente = new Date(`${reserva.fechaReserva}T${reserva.horaFin}`);
    const inicioNueva   = new Date(`${nueva.fechaReserva}T${nueva.horaReserva}`);
    const finNueva      = new Date(`${nueva.fechaReserva}T${nueva.horaFin}`);

    return (inicioNueva < finExistente && finNueva > inicioExistente);
  });
}

function verificarReservasVencidas() {
  const ahora = new Date();

  listaReservas.forEach((reserva) => {
    const inicio = new Date(`${reserva.fechaReserva}T${reserva.horaReserva}`);
    const fin = new Date(`${reserva.fechaReserva}T${reserva.horaFin}`);
    let mesa = listaMesas.find(m => m.nombreMesa === reserva.mesaSeleccionada);

    if (reserva.estadoReserva === "Pendiente") {
      if (ahora >= inicio && ahora < fin) {
        reserva.estadoReserva = "Confirmada";
        if (mesa) mesa.estadoMesa = "ocupada";
      }
      if (ahora >= fin) {
        reserva.estadoReserva = "Finalizada";
        if (mesa) mesa.estadoMesa = "disponible";
      }
    }
  });

  localStorage.setItem("listaMesas", JSON.stringify(listaMesas));
  guardarListaReservas();
  mostrarReservas();
}

setInterval(() => {
  verificarReservasVencidas();
  mostrarReservas();
}, 60000);

function cargarMesasDisponibles(selectedMesa = null) {
  const select = document.getElementById("selectMesaDisponible");
  select.innerHTML = "";

  listaMesas
    .filter(m => {
      if (selectedMesa && m.nombreMesa === selectedMesa) return true; 
      return (m.estadoMesa || "").toLowerCase() !== "deshabilitada";
    })
    .forEach(m => {
      let option = document.createElement("option");
      option.value = m.nombreMesa;
      const desh = (m.estadoMesa || "").toLowerCase() === "deshabilitada";
      option.textContent = `${m.nombreMesa} - Capacidad ${m.capacidadMesa}${desh ? " (deshabilitada)" : ""}`;
      select.appendChild(option);
    });
}

function mostrarReservas() {
  const contenedor = document.getElementById("contenedorReservas");
  contenedor.innerHTML = "";

  const filtroFecha = document.getElementById("filtroFecha")?.value;
  const filtroEstado = document.getElementById("filtroEstado")?.value;

  listaReservas
    .filter(reserva => {
      if (filtroFecha && reserva.fechaReserva !== filtroFecha) return false;
      if (filtroEstado && filtroEstado !== "Todos" && reserva.estadoReserva !== filtroEstado) return false;
      return true;
    })
    .forEach((reserva, i) => {
      let div = document.createElement("div");
      div.classList.add("col-md-4");

      let estadoColor = {
        "Pendiente": "text-warning",
        "Confirmada": "text-info",
        "Cancelada": "text-danger",
        "Finalizada": "text-success",
        "Expirada por tiempo": "text-secondary",
        "No show": "text-muted"
      }[reserva.estadoReserva] || "text-white";

      let imagenOcasion = reserva.ocasion ? imagenesOcasion[reserva.ocasion] || "" : "";

      // 🔹 Deshabilitar botones si el estado ya no permite acciones
      const disabled = ["Finalizada", "Cancelada", "No show"].includes(reserva.estadoReserva) ? "disabled" : "";

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
            <p class="mb-3">Duración: ${reserva.duracionHoras}h</p>
            <p class="mb-3">Estado: <strong class="${estadoColor}">${reserva.estadoReserva}</strong></p>
            
            <div class="btn-group-actions">
              <button class="btn btn-success btn-sm" onclick="pagarReserva(${i})" ${disabled}>💳 Pagar</button>
              <button class="btn btn-warning btn-sm" onclick="editarReserva(${i})" ${disabled}>✏️ Editar</button>
              <button class="btn btn-danger btn-sm" onclick="cancelarReserva(${i})" ${disabled}>❌ Cancelar</button>
              <button class="btn btn-outline-danger btn-sm" onclick="eliminarReserva(${i})" ${disabled}>🗑️ Eliminar</button>
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
  const form = e.currentTarget;
  e.preventDefault(); 
  if (!form.checkValidity()) {
    mostrarAlerta("Campos obligatorios", "Revisa los campos del formulario.");
    return;
  }

  const idx = document.getElementById("indiceReserva").value;
  const nombreCliente = document.getElementById("inputNombreCliente").value.trim();
  const fechaReserva = document.getElementById("inputFechaReserva").value;
  const horaReserva = document.getElementById("inputHoraReserva").value;
  const cantidadPersonas = parseInt(document.getElementById("inputCantidadPersonas").value, 10);
  const mesaSeleccionada = document.getElementById("selectMesaDisponible").value;
  const ocasion = document.getElementById("selectOcasión").value;
  const notasReserva = document.getElementById("inputNotasReserva").value.trim();
  const duracionHoras = parseInt(document.getElementById("inputDuracion").value, 10);

  const mesa = listaMesas.find(m => m.nombreMesa === mesaSeleccionada);
  if (mesa && cantidadPersonas > mesa.capacidadMesa) {
    mostrarAlerta("Capacidad excedida", `La mesa "${mesaSeleccionada}" solo permite hasta ${mesa.capacidadMesa} personas.`);
    return;
  }

  let inicioNueva = new Date(`${fechaReserva}T${horaReserva}`);
  let finNueva = new Date(inicioNueva.getTime() + duracionHoras * 60 * 60 * 1000);

  const grupoEstadoReserva = document.getElementById("grupoEstadoReserva");
  const selectEstadoReserva = document.getElementById("selectEstadoReserva");
  const estadoSeleccionado = (grupoEstadoReserva && !grupoEstadoReserva.classList.contains("d-none"))
    ? (selectEstadoReserva.value || "Pendiente")
    : "Pendiente";

  const nuevaReserva = {
    nombreCliente,
    fechaReserva,
    horaReserva,
    cantidadPersonas,
    mesaSeleccionada,
    ocasion,
    notasReserva,
    estadoReserva: estadoSeleccionado,
    duracionHoras,
    horaFin: finNueva.toTimeString().slice(0,5)
  };

  if (hayChoqueDeHorario(nuevaReserva, idx ? parseInt(idx) : null)) {
    mostrarAlerta("Horario no disponible", "La mesa ya tiene otra reserva en ese horario.");
    return;
  }

  if (idx) {
    listaReservas[idx] = { ...listaReservas[idx], ...nuevaReserva };
  } else {
    listaReservas.push(nuevaReserva);
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
  document.getElementById("inputDuracion").value = reserva.duracionHoras;

  cargarMesasDisponibles(reserva.mesaSeleccionada);
  document.getElementById("selectMesaDisponible").value = reserva.mesaSeleccionada;

  const grupoEstadoReserva = document.getElementById("grupoEstadoReserva");
  const selectEstadoReserva = document.getElementById("selectEstadoReserva");
  if (grupoEstadoReserva && selectEstadoReserva) {
    grupoEstadoReserva.classList.remove("d-none");
    selectEstadoReserva.value = reserva.estadoReserva || "Pendiente";
  }

  new bootstrap.Modal(document.getElementById("modalReserva")).show();
}

document.getElementById("btnAgregarReserva").addEventListener("click", () => {
  const form = document.getElementById("formularioReserva");
  form.reset();
  document.getElementById("indiceReserva").value = "";

  cargarMesasDisponibles();

  const grupoEstadoReserva = document.getElementById("grupoEstadoReserva");
  const selectEstadoReserva = document.getElementById("selectEstadoReserva");
  if (grupoEstadoReserva && selectEstadoReserva) {
    grupoEstadoReserva.classList.add("d-none");
    selectEstadoReserva.value = "Pendiente";
  }

  new bootstrap.Modal(document.getElementById("modalReserva")).show();
});

document.addEventListener("DOMContentLoaded", () => {
  mostrarReservas();
  verificarReservasVencidas();

  const mesaPreseleccionada = localStorage.getItem("mesaParaReservar");
  if (mesaPreseleccionada) {
    localStorage.removeItem("mesaParaReservar");

    const form = document.getElementById("formularioReserva");
    form.reset();
    document.getElementById("indiceReserva").value = "";

    cargarMesasDisponibles();
    const select = document.getElementById("selectMesaDisponible");
    const existe = Array.from(select.options).some(op => op.value === mesaPreseleccionada);

    if (existe) {
      select.value = mesaPreseleccionada;
    } else {
      mostrarAlerta("Mesa no disponible", `La mesa "${mesaPreseleccionada}" está deshabilitada. Por favor, elige otra.`);
    }

    const grupoEstadoReserva = document.getElementById("grupoEstadoReserva");
    const selectEstadoReserva = document.getElementById("selectEstadoReserva");
    if (grupoEstadoReserva && selectEstadoReserva) {
      grupoEstadoReserva.classList.add("d-none");
      selectEstadoReserva.value = "Pendiente";
    }

    new bootstrap.Modal(document.getElementById("modalReserva")).show();
  }

  document.getElementById("filtroFecha")?.addEventListener("change", mostrarReservas);
  document.getElementById("filtroEstado")?.addEventListener("change", mostrarReservas);
});

