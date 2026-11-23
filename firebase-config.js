/* firebase-config.js
   Inicializa Firebase (modo compat) y deja disponible window.db (Firestore)
   Si cambias la configuración en Firebase Console, actualiza esta constante.
*/

(function(){
  const firebaseConfig = {
    apiKey: "AIzaSyAOAjfoxPMk2eE6maO5KUgQcWkrsUDxQyk",
    authDomain: "cetis50web.firebaseapp.com",
    projectId: "cetis50web",
    storageBucket: "cetis50web.firebasestorage.app",
    messagingSenderId: "202492003192",
    appId: "1:202492003192:web:0212f791eb0a4740cd3e8d"
  };

  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK no cargado. Asegúrate de incluir firebase-app-compat.js antes de este archivo.');
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
  } catch(e){
    // Puede lanzar si ya fue inicializado, se ignora.
  }

  // Exportar referencia a Firestore para usar en app.js
  window.db = firebase.firestore();
})();