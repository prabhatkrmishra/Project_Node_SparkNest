import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./pages/About";
import Category from "./pages/Category";
import Categories from "./pages/Categories";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import GoogleLogin from "./pages/components/GoogleLogin";
import Details from "./pages/components/Details";
import Settings from "./pages/Settings";
import CreateBlog from "./pages/CreateBlog";
import Article from "./pages/components/StandardPost";
import Error from "./pages/Error";
import Styles from "./pages/Styles";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Index />} />
        <Route exact path="/category/:type" element={<Category />} />
        <Route exact path="/category" element={<Category />} />
        <Route exact path="/category/categories" element={<Categories />} />
        <Route exact path="/create" element={<CreateBlog />} />
        <Route exact path="/session/new" element={<Login />} />
        <Route exact path="/signup/new" element={<Signup />} />
        <Route exact path="/google/login" element={<GoogleLogin />} />
        <Route exact path="/profile" element={<Profile />} />
        <Route exact path="/profile/details" element={<Details />} />
        <Route exact path="/profile/:section" element={<Profile />} />
        <Route exact path="/account/settings" element={<Settings />} />
        <Route exact path="/account/settings/:section" element={<Settings />} />
        <Route exact path="/about" element={<About />} />
        <Route exact path="/contact" element={<Contact />} />
        <Route exact path="/styles" element={<Styles />} />
        <Route path="*" element={<Error />} />

        <Route exact path="/category/article" element={<Article />} />
        <Route exact path="/blogs/article" element={<Article />} />
      </Routes>
    </Router>
  );
}

export default App;
