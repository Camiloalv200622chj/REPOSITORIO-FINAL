let listaMesas = JSON.parse(localStorage.getItem("listaMesas")) || [];

function guardarListaMesas() {
  localStorage.setItem("listaMesas", JSON.stringify(listaMesas));
}

function mostrarMesas() {
  const contenedorMesas = document.getElementById("contenedorMesas");
  contenedorMesas.innerHTML = "";

  listaMesas.forEach((mesa, i) => {
    let badgeColor;
    if (mesa.estadoMesa === "disponible") badgeColor = "success";
    else if (mesa.estadoMesa === "ocupada") badgeColor = "danger";
    else badgeColor = "secondary";

    let div = document.createElement("div");
    div.classList.add("col-md-3");

    div.innerHTML = `
      <div class="tarjeta-mesa-dark estado-${mesa.estadoMesa} p-3 rounded border border-light">
        <h5>${mesa.nombreMesa}</h5>
        <p>Capacidad: ${mesa.capacidadMesa}</p>
        <p>Ubicación: ${mesa.ubicacionMesa}</p>
        <p>Estado: <span class="badge bg-${badgeColor}">${mesa.estadoMesa}</span></p>
        <div class="mt-2">
          <button class="btn btn-warning btn-sm" onclick="editarMesa(${i})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarMesa(${i})">Eliminar</button>
          ${
            mesa.estadoMesa === "disponible" 
              ? `<a href="reservas_dark.html?mesa=${encodeURIComponent(mesa.nombreMesa)}" class="btn btn-success btn-sm">Reservar</a>` 
              : ""
          }
        </div>
      </div>
    `;
    contenedorMesas.appendChild(div);
  });
}

document.getElementById("btnAgregarMesa").addEventListener("click", () => {
  document.getElementById("formularioMesa").reset();
  document.getElementById("indiceMesa").value = "";
  new bootstrap.Modal(document.getElementById("modalMesa")).show();
});

document.getElementById("formularioMesa").addEventListener("submit", (e) => {
  e.preventDefault();

  const idx = document.getElementById("indiceMesa").value;
  const capacidad = document.getElementById("inputCapacidadMesa").value;
  const ubicacion = document.getElementById("inputUbicacionMesa").value;
  const estado = document.getElementById("selectEstadoMesa").value;

  if (idx) {
    listaMesas[idx].capacidadMesa = capacidad;
    listaMesas[idx].ubicacionMesa = ubicacion;
    listaMesas[idx].estadoMesa = estado;
  } else {
    listaMesas.push({
      nombreMesa: `Mesa ${listaMesas.length + 1}`,
      capacidadMesa: capacidad,
      ubicacionMesa: ubicacion,
      estadoMesa: estado
    });
  }

  guardarListaMesas();
  mostrarMesas();
  bootstrap.Modal.getInstance(document.getElementById("modalMesa")).hide();

  Swal.fire({
    icon: "success",
    title: "Éxito",
    text: "Mesa guardada correctamente",
    timer: 1500,
    showConfirmButton: false
  });
});

function editarMesa(i) {
  const mesa = listaMesas[i];
  document.getElementById("indiceMesa").value = i;
  document.getElementById("inputCapacidadMesa").value = mesa.capacidadMesa;
  document.getElementById("inputUbicacionMesa").value = mesa.ubicacionMesa;
  document.getElementById("selectEstadoMesa").value = mesa.estadoMesa;
  new bootstrap.Modal(document.getElementById("modalMesa")).show();
}

function eliminarMesa(i) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará la mesa.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      listaMesas.splice(i, 1);
      guardarListaMesas();
      mostrarMesas();

      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "La mesa fue eliminada correctamente",
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", mostrarMesas);
