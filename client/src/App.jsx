import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./pages/About";
import Category from "./pages/Category";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import Styles from "./pages/Styles";
import Article from "./pages/components/AudioPost";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Index />} />
        <Route exact path="/category" element={<Category />} />
        <Route exact path="/category/article" element={<Article />} />
        <Route exact path="/blogs" element={<Blogs />} />
        <Route exact path="/blogs/article" element={<Article />} />
        <Route exact path="/styles" element={<Styles />} />
        <Route exact path="/about" element={<About />} />
        <Route exact path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
