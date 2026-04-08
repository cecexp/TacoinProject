# 🌮 Tacoin Tycoon — React Native + Expo

Migración completa de Unity C# → React Native (Expo).  
Corre en **iOS, Android y Web** sin cambios.

---

## Estructura del proyecto

```
tacoin-app/
├── App.js                        ← Raíz de la app (navegador de pantallas)
├── src/
│   ├── context/
│   │   └── GameContext.js        ← Toda la lógica del juego (EconomyManager, CryptoSimSystem,
│   │                                GameLoopManager, DecisionHistoryManager)
│   ├── data/
│   │   └── gameData.js           ← Datos del juego (decisiones, noticias, config)
│   ├── screens/
│   │   ├── GameScreen.js         ← Pantalla principal (DailyDecisionUIController)
│   │   ├── WeeklyReportScreen.js ← Reporte semanal (WeeklyReportUIController)
│   │   └── BankruptScreen.js     ← Pantalla de bancarrota
│   └── components/
│       ├── HUD.js                ← HUD financiero (HUDController)
│       ├── DecisionCard.js       ← Botón de decisión (DecisionOptionButton)
│       ├── EducationPopup.js     ← Pop-up educativo (EducationPopupController)
│       └── NoticiaPopup.js       ← Noticias del barrio (BarrioNewsEvent)
├── package.json
├── app.json
└── babel.config.js
```

---

## Equivalencias Unity → React Native

| Script Unity (C#) | Equivalente en React Native |
|---|---|
| `EconomyManager.cs` | `GameContext.js` — estado `efectivoNegocio`, `ahorroPersonal`, `carteraCrypto` |
| `CryptoSimSystem.cs` | `GameContext.js` — función `terminarDia()` con volatilidad aleatoria |
| `GameLoopManager.cs` | `GameContext.js` — `diaGlobal`, `diaSemana`, `accionesRestantes` |
| `DecisionHistoryManager.cs` | `GameContext.js` — array `historial`, función `calcularResumenSemana()` |
| `HUDController.cs` | `HUD.js` |
| `DailyDecisionUIController.cs` | `GameScreen.js` |
| `DecisionOptionButton.cs` | `DecisionCard.js` |
| `EducationPopupController.cs` | `EducationPopup.js` |
| `WeeklyReportUIController.cs` | `WeeklyReportScreen.js` |
| `BarrioNewsEvent.cs` (ScriptableObject) | `gameData.js` — array `NOTICIAS_BARRIO` |
| `DecisionesDiarias.cs` (ScriptableObject) | `gameData.js` — objeto `DECISIONES_POR_DIA` |

---

## Setup en 2 minutos

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación

```bash
# 1. Instalar dependencias
cd tacoin-app
npm install

# 2. Correr en web (más rápido para probar)
npm run web

# 3. Correr en móvil (necesitas Expo Go app en tu celular)
npm start
# Escanea el QR con la cámara (iOS) o con Expo Go (Android)
```

### Build para producción web

```bash
npm run build:web
# Los archivos quedan en dist/ — súbelos a Netlify, Vercel, o GitHub Pages
```

### Build para App Stores (cuando estés listo)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar y hacer build
eas build --platform ios
eas build --platform android
```

---

## Cómo agregar más días / decisiones

En `src/data/gameData.js`, agrega entradas al objeto `DECISIONES_POR_DIA`:

```js
7: [
  {
    id: "D7_A",
    titulo: "Mi decisión nueva 🌮",
    descripcion: "Descripción de la opción.",
    consejo: "Tip financiero educativo.",
    deltaEfectivo: -100,
    deltaAhorro: 50,
    deltaCrypto: 0,
    esRecomendada: true,
  },
  // ...más opciones
],
```

## Cómo agregar noticias del barrio

En `src/data/gameData.js`, agrega al array `NOTICIAS_BARRIO`:

```js
{
  id: "mi_noticia",
  titulo: "📰 Título de la noticia",
  descripcion: "Descripción del evento.",
  cambioPorcentualPrecio: 0.15,  // +15% (negativo para bajar)
},
```

---

## Notas de migración

- Los **Singletons de Unity** (`Instance`) se reemplazaron con un único **React Context** (`GameContext`)
- Los **eventos de C#** (`Action`, `event`) se reemplazaron con **re-renders de React**
- Los **ScriptableObjects** de Unity se convierten a **objetos JS planos** en `gameData.js`
- `MonoBehaviour` no existe en React; toda la lógica vive en el **reducer** del Context
- `Mathf.Clamp` → `Math.min(Math.max(x, min), max)`
- `Mathf.Lerp` → función `lerp()` local en GameContext
