const container = document.querySelector('.container');
const formulario = document.querySelector('#formulario');
const ciudadInput = document.querySelector('#ciudad');
const paisInput = document.querySelector('#pais');

//Variables de la card con el resultado
const cardCiudad = document.querySelector('#card_ciudad');
const cardActualizado = document.querySelector('#card_actualizado');
const cardCondicionActual = document.querySelector('#card_condicion_actual');
const cardIcono = document.querySelector('#card_icono');
const cardTempActual = document.querySelector('#card_temperatura_actual');
const cardTemperatura = document.querySelector('#card_temperatura');
const cardSensacion = document.querySelector('#card_sensacion');
const cardMinima = document.querySelector('#card_minima');
const cardMaxima = document.querySelector('#card_maxima');
const cardHumedad = document.querySelector('#card_humedad');
const cardViento = document.querySelector('#card_viento');

document.addEventListener('DOMContentLoaded', () => {
  formulario.addEventListener('submit', buscarClima);

  obtenerUbicacion();
  rellenarOptions();
});

function buscarClima(e) {
  e.preventDefault();

  //Validar
  const ciudad = ciudadInput.value;
  const pais = paisInput.value;

  if (pais === '' || ciudad === '') {
    //Hubo un error
    mostrarError('Ambos campos son obligatorios');
    return;
  }
  //Consultar API
  consultarAPI(ciudad, pais);
}

function mostrarError(mensaje) {
  //Crear un alerta
  const error = document.querySelector('.error');
  if (!error) {
    const alerta = document.createElement('div');
    alerta.classList.add(
      'bg-red-200',
      'border-red-400',
      'text-red-700',
      'px-4',
      'py-3',
      'rounded',
      'max-w-md',
      'mx-auto',
      'mt-6',
      'text-center',
      'error'
    );
    alerta.innerHTML = `
        <strong class="font-bold">Error!</strong>
        <span class="block">${mensaje}</span>
    `;
    formulario.appendChild(alerta);

    setTimeout(() => {
      alerta.remove();
    }, 3000);
  }
}

async function consultarAPI(ciudad, pais) {
  const appKEY = 'fc6a1cbe8e03d34e11457d0c8e2e02cc';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad},${pais}&appid=${appKEY}`;

  try {
    let respuesta = await fetch(url);
    let data = await respuesta.json();
    mostrarResultado(data);
  } catch (error) {
    mostrarError(error);
  }
}

function mostrarResultado(resultado) {
  if (resultado.message === 'city not found') {
    mostrarError('Ciudad no encontrada');
    return;
  }
  //Datos principales
  const { temp, temp_max, temp_min, humidity, feels_like } = resultado.main;

  //Obtener icono y estado del tiempo descriptivos
  const { icon, description } = resultado.weather[0];

  //Datos del viento
  const { deg, speed } = resultado.wind;

  cardCiudad.textContent = `${resultado.name}, ${resultado.sys.country}`;
  //Api devuelvo el dt en timestamp, formateamos para mostrar DD/MM/YY HH:MM:SS
  cardActualizado.textContent = new Date(resultado.dt * 1000).toLocaleString();
  cardIcono.setAttribute(
    'src',
    `http://openweathermap.org/img/wn/${icon}@2x.png`
  );
  /*Llena el valor de condicion actualizada*/traducirCondicionActual(description);
  cardTempActual.textContent = formatearTemperatura(temp);
  cardViento.textContent = formatearViento(deg, speed);
  cardHumedad.textContent = humidity + '%';
  cardTemperatura.textContent = formatearTemperatura(temp);
  cardSensacion.textContent = formatearTemperatura(feels_like);
  cardMinima.textContent = formatearTemperatura(temp_min);
  cardMaxima.textContent = formatearTemperatura(temp_max);

  ciudadInput.value = '';
  paisInput.value = '';
}

function obtenerUbicacion() {
  const appkey = 'fc6a1cbe8e03d34e11457d0c8e2e02cc';
  let url;

  navigator.geolocation.getCurrentPosition(async (res) => {
    url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${res.coords.latitude}&lon=${res.coords.longitude}&limit=1&appid=${appkey}&lang={sp}`;

    try {
      let respuesta = await fetch(url);
      let data = await respuesta.json();
      consultarAPI(data[0].name, data[0].country);
    } catch (error) {
      console.log(error);
    }
  });
}

function formatearTemperatura(dato) {
  dato = (dato / 10).toFixed(1);
  dato += '°C';
  return dato;
}

function formatearViento(grados, velocidad) {
  let direcion;

  //Calcular direccion del viento segun los grados que obtemos de la api
  if (grados && velocidad) {
    if ((grados > 341 && grados <= 360) || (grados > 0 && grados <= 20)) {
      direcion = 'N';
    } else if (grados > 290 && grados <= 340) {
      direcion = 'NO';
    } else if (grados > 251 && grados <= 290) {
      direcion = 'O';
    } else if (grados > 200 && grados <= 250) {
      direcion = 'SO';
    } else if (grados > 160 && grados <= 200) {
      direcion = 'S';
    } else if (grados > 110 && grados <= 160) {
      direcion = 'SE';
    } else if (grados > 70 && grados <= 110) {
      direcion = 'E';
    } else if (grados > 20 && grados <= 70) {
      direcion = 'NE';
    }
  } else {
    return 'Sin datos';
  }

  //calcular los km/h en base a los m/s que nos brinda la api
  velocidad = (velocidad * 3.6).toFixed(1);

  return `${direcion} ${velocidad} Km/h`;
}

// function traducirCondicionActual(condicion) {
//   var xhttp = new XMLHttpRequest();
//   xhttp.open(
//     'GET',
//     'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=' +
//       condicion,
//     false
//   );
//   xhttp.send();
//   var response = JSON.parse(xhttp.responseText);
//   return response[0][0][0];
// }

async function traducirCondicionActual(condicion){
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${condicion}`;
  
  
  try {
    let respuesta = await fetch(url);
    const traduccion = await respuesta.json();
    cardCondicionActual.textContent = traduccion[0][0][0]
  } catch (error) {
    console.log(error)
  }
}

async function rellenarOptions() {
  const url =
    'https://restcountries.com/v2/all?fields=alpha2Code,translations,population';

  try {
    let respuesta = await fetch(url);
    const paises = await respuesta.json();

    paises.forEach((pais) => {
      const { alpha2Code, translations, population } = pais;

      if (population > 2000000) {
        const option = document.createElement('option');
        option.value = alpha2Code;
        option.textContent = translations['es'];
        paisInput.appendChild(option);
      }
    });
  } catch (error) {
    mostrarError(error);
  }
}
