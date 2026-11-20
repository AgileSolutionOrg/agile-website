"use strict";
// Cartão do montador: desenha o QR de entrada (abre o site já com a câmera ligada).
const el = document.getElementById("qr");
new QRCode(el, { text: el.dataset.url, width: 512, height: 512, correctLevel: QRCode.CorrectLevel.M });
document.getElementById("bImprimir").onclick = () => print();
