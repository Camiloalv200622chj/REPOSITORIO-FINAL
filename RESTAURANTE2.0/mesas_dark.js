document.addEventListener("DOMContentLoaded", () => {
  let listaReservas = JSON.parse(localStorage.getItem("listaReservas")) || [];
  let listaMesas = JSON.parse(localStorage.getItem("listaMesas")) || [];

  function mostrarAlerta(titulo, mensaje) {
    const label = document.getElementById("modalAlertaLabel");
    const body = document.getElementById("modalAlertaMensaje");
    const modal = document.getElementById("modalAlerta");
    if (label) label.textContent = titulo || "Aviso";
    if (body) body.textContent = mensaje || "";
    if (modal && window.bootstrap?.Modal) new bootstrap.Modal(modal).show();
  }

  const btnAgregarMesa = document.getElementById("btnAgregarMesa");
  const modalMesaEl   = document.getElementById("modalMesa");
  const modalMesa     = modalMesaEl && window.bootstrap?.Modal ? new bootstrap.Modal(modalMesaEl) : null;

  const formMesa          = document.getElementById("formularioMesa");
  const grupoEstadoMesa   = document.getElementById("grupoEstadoMesa");
  const selectEstadoMesa  = document.getElementById("selectEstadoMesa");
  const indiceMesa        = document.getElementById("indiceMesa");
  const inputCapacidad    = document.getElementById("inputCapacidadMesa");
  const inputUbicacion    = document.getElementById("inputUbicacionMesa");

  function mostrarMesas() {
    const contenedor = document.getElementById("contenedorMesas");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    listaMesas.forEach((m, i) => {
      const nombre = m.nombreMesa || `Mesa ${i + 1}`;
      const estado = (m.estadoMesa || "disponible").toLowerCase(); 

      const col = document.createElement("div");
      col.className = "col-sm-6 col-md-4";
      col.innerHTML = `
        <div class="card h-100 mesa-card estado-${estado}" data-estado="${estado}">
          <div class="card-body">
            <h5 class="card-title">${nombre}</h5>
            <p class="mb-1">Capacidad: ${m.capacidadMesa}</p>
            <p class="mb-1">Ubicación: ${m.ubicacionMesa}</p>
            <p class="mb-3 estado-mesa-texto">Estado: ${m.estadoMesa}</p>

            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarMesa(${i})">🗑️ Eliminar</button>
              <button class="btn btn-sm btn-warning" onclick="editarMesa(${i})">✏️ Editar</button>
              <button class="btn btn-sm btn-primary" onclick="reservarMesa(${i})">📅 Reservar</button>
            </div>
          </div>
        </div>
      `;
      contenedor.appendChild(col);
    });
  }

  function prepararModalMesaParaCrear() {
    if (!formMesa) return;
    indiceMesa.value = "";
    inputCapacidad.value = "";
    inputUbicacion.value = "";
    if (grupoEstadoMesa) grupoEstadoMesa.classList.add("d-none"); 
    if (selectEstadoMesa) selectEstadoMesa.value = "disponible";  
    const t = document.getElementById("modalMesaLabel");
    if (t) t.textContent = "Crear Mesa";
  }

  function prepararModalMesaParaEditar(mesa) {
    if (!formMesa) return;
    if (grupoEstadoMesa) grupoEstadoMesa.classList.remove("d-none"); 
    const t = document.getElementById("modalMesaLabel");
    if (t) t.textContent = "Editar Mesa";
    inputCapacidad.value = mesa.capacidadMesa;
    inputUbicacion.value = mesa.ubicacionMesa;
    if (selectEstadoMesa) selectEstadoMesa.value = mesa.estadoMesa || "disponible";
  }

  if (btnAgregarMesa && modalMesa) {
    btnAgregarMesa.addEventListener("click", () => {
      prepararModalMesaParaCrear();
      modalMesa.show();
    });
  }

  window.editarMesa = (i) => {
    const mesa = listaMesas[i];
    if (!mesa || !modalMesa) return;
    indiceMesa.value = i;
    prepararModalMesaParaEditar(mesa);
    modalMesa.show();
  };

  window.eliminarMesa = (i) => {
    if (listaMesas[i] == null) return;
    listaMesas.splice(i, 1);
    localStorage.setItem("listaMesas", JSON.stringify(listaMesas));
    mostrarMesas();
  };

  window.reservarMesa = (i) => {
    const mesa = listaMesas[i];
    if (!mesa) return;
    const nombreMesa = mesa.nombreMesa || `Mesa ${i + 1}`;
    localStorage.setItem("mesaParaReservar", nombreMesa);
    window.location.href = "reservas_dark.html";
  };

  if (formMesa) {
    formMesa.addEventListener("submit", (e) => {
      if (!formMesa.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        formMesa.classList.add("was-validated");
        mostrarAlerta("Campos obligatorios", "Revisa los campos del formulario de Mesa.");
        return;
      }
      e.preventDefault();

      const idx = indiceMesa.value;
      const capacidadMesa = parseInt(inputCapacidad.value, 10);
      const ubicacionMesa = inputUbicacion.value.trim();

      if (!ubicacionMesa) {
        mostrarAlerta("Campo vacío", "La ubicación de la mesa no puede estar vacía.");
        inputUbicacion.classList.add("is-invalid");
        return;
      } else {
        inputUbicacion.classList.remove("is-invalid");
      }

      if (isNaN(capacidadMesa) || capacidadMesa <= 0) {
        mostrarAlerta("Capacidad inválida", "La capacidad debe ser un número mayor que 0.");
        inputCapacidad.classList.add("is-invalid");
        return;
      } else {
        inputCapacidad.classList.remove("is-invalid");
      }

      if (idx === "") {
        const nuevaMesa = {
          nombreMesa: `Mesa ${listaMesas.length + 1}`,
          capacidadMesa,
          ubicacionMesa,
          estadoMesa: "disponible",
        };
        listaMesas.push(nuevaMesa);
      } else {
        listaMesas[idx] = {
          ...listaMesas[idx],
          capacidadMesa,
          ubicacionMesa,
          estadoMesa: selectEstadoMesa?.value || "disponible",
        };
      }

      localStorage.setItem("listaMesas", JSON.stringify(listaMesas));
      mostrarMesas();
      modalMesa?.hide();
    });
  }

  mostrarMesas();
});
