// ----IMPORTS----
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ----CSS----
import "bootstrap/dist/css/bootstrap.min.css";

// ----COMPONENTS----
import Home from "../pages/Home";
import Posts from "../pages/Posts"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
