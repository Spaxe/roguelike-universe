/**
 * Roguelike Universe
 * Author: Xavier Ho <contact@xavierho.com>
 * https://github.com/Spaxe/roguelike-universe
 */

import React from "react";
import ReactDOM from "react-dom";
import { Universe } from "./universe";

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Universe />,
    document.getElementById('container')
  );
});

