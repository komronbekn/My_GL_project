import React, { useState } from "react"
import LoginPage from "./LoginPage"
import { Route, Routes } from "react-router-dom"
import Router from "./utils/Router"

function App() {
  const [route, setRoute] = useState(Router)
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </>
  )
}

export default App
