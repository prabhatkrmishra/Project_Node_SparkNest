// @ts-nocheck
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from "./components/ErrorBoundary";
import About from "./pages/About";
import Category from "./pages/Category";
import Categories from "./pages/Categories";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/components/passwords/ForgotPassword";
import ResetMain from "./pages/components/passwords/ResetMain";
import Profile from "./pages/Profile";
import GoogleLogin from "./pages/components/GoogleLogin";
import Details from "./pages/components/Details";
import Settings from "./pages/Settings";
import CreateArticle from "./pages/components/create/CreateArticle";
import PublishArticle from "./pages/components/create/PublishArticle";
import UpdateArticle from "./pages/components/update/UpdateArticle";
import UpdatePublish from "./pages/components/update/UpdatePublish";
import Article from "./pages/components/StandardPost";
import UserProfile from "./pages/UserProfile";
import Error from "./pages/Error";
import Styles from "./pages/Styles";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/article/view/:selector" element={<Article />} />
              <Route path="/category/:type" element={<Category />} />
              <Route path="/category" element={<Category />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/create" element={<CreateArticle />} />
              <Route path="/publish" element={<PublishArticle />} />
              <Route path="/article/edit" element={<UpdateArticle />} />
              <Route path="/article/update/publish" element={<UpdatePublish />} />
              <Route path="/session/new" element={<Login />} />
              <Route path="/signup/new" element={<Signup />} />
              <Route path="/password/request" element={<ForgotPassword />} />
              <Route path="/password/reset/:email/:token" element={<ResetMain />} />
              <Route path="/google/login" element={<GoogleLogin />} />
              <Route path="/google/success" element={<GoogleLogin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/details" element={<Details />} />
              <Route path="/profile/:section" element={<Profile />} />
              <Route path="/account/settings" element={<Settings />} />
              <Route path="/account/settings/:section" element={<Settings />} />
              <Route path="/user/:usertag" element={<UserProfile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/styles" element={<Styles />} />
              <Route path="*" element={<Error />} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </HelmetProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
