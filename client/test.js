/*import { useEffect, useState } from "react";
import Header from "./components/Header"
import Body from "./components/Body"
import Footer from "./components/Footer"
import { getHome, getMessage, sendMessage } from "./api";

function App() {
  const [blogs, setBlogs] = useState([]);
  const [message, setMessage] = useState("");
  const [data, setData] = useState({ name: "", email: "" });
  const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    getHome()
      .then((response) => setBlogs(response.data))
      .catch((error) => console.error("Error fetching blogs:", error));
  }, []);

  function fetch() {
    getMessage()
      .then((response) => setMessage(response.data))
      .catch((error) => console.error("Error fetching blogs:", error));
  }

  const handleChange = (event) => {
    setData({ ...data, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      console.log("Response from server:", (await sendMessage(data)).data.receivedData);
    } catch (error) {
      console.error("There was an error!", error);
    }
  };

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        <h1>{blogs.message}</h1>
      </ul>
      <button onClick={fetch}>Click me</button>
      {message ? <p>{message.message}</p> : <p>No message</p>}

      <h1>Submit Form Data</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={data.name}
          placeholder="Name"
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          value={data.email}
          placeholder="Email"
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}*/

/*useEffect(() => {
  const preloader = document.querySelector("#preloader");
  if (!preloader) {
    return;
  }

  document.documentElement.classList.add("ss-preload");

  const handleLoad = () => {
    document.documentElement.classList.remove("ss-preload");
    document.documentElement.classList.add("ss-loaded");
  
    // Force reflow
    preloader.offsetHeight; // This forces a reflow to apply CSS changes
  
    const hidePreloader = () => {
      preloader.remove(); // Remove the preloader from the DOM
    };
  
    preloader.addEventListener("transitionend", hidePreloader);
  
    setTimeout(() => {
      if (preloader.style.display !== "none") {
        preloader.style.display = "none";
      }
    }, 3000);
  };

  window.addEventListener("load", handleLoad);
}, []);*/