// App.jsx
import React from "react";
import { Provider } from "react-redux";
import store from "./store"; // chemin vers index.js
import Routes from "./routes";

function App() {
  return (
    <Provider store={store}>
      <Routes />
    </Provider>
  );
}

export default App;
