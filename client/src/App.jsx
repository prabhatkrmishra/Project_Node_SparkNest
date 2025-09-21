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
import CreateArticle from "./pages/components/create/CreateArticle";
import PublishArticle from "./pages/components/create/PublishArticle";
import UpdateArticle from "./pages/components/update/UpdateArticle";
import UpdatePublish from "./pages/components/update/UpdatePublish";
import Article from "./pages/components/StandardPost";
import Error from "./pages/Error";
import Styles from "./pages/Styles";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Index />} />
        <Route exact path="/article/view/:selector" element={<Article />} />
        <Route exact path="/category/:type" element={<Category />} />
        <Route exact path="/category" element={<Category />} />
        <Route exact path="/category/categories" element={<Categories />} />
        <Route exact path="/create" element={<CreateArticle />} />
        <Route exact path="/publish" element={<PublishArticle/>} />
        <Route exact path="/article/edit" element={<UpdateArticle />} />
        <Route exact path="/article/update/publish" element={<UpdatePublish />} />
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
      </Routes>
    </Router>
  );
}

export default App;
