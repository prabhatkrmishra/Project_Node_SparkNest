import { Helmet } from "react-helmet";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

import { fetchCategories, updateArticle } from "../../../api/API";

import PreLoader from "../PreLoader";
import Header from "../Header";
import MoveToEffect from "../effects/MoveToEffect";
import addIcon from "../../../assets/svg/input.svg";
import ErrorMessage from "../messageBox/ErrorMessage";

import logout from "../tools/auth";
import { getItem } from "../tools/IndexDBstorage";

const UpdatePublish = () => {
  const navigate = useNavigate();
  const login = Cookies.get("isLoggedIn") || null;
  if (!login) {
    navigate("/session/new");
  }
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  if (!user) {
    logout();
  }

  const [error, setError] = useState(false);
  const [errorMssg, setErrorMssg] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const maxCharLimit = 46;

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!e.target.value) {
      setIsDropdownOpen(false);
    } else {
      setIsDropdownOpen(true);
    }
    setError(false);
  };

  useEffect(() => {
    const getCategories = async () => {
      if (inputValue) {
        const response = await fetchCategories(inputValue);
        setFilteredCategories(
          Array.isArray(response.data) ? response.data : []
        );
      } else {
        setFilteredCategories([]);
      }
    };
    getCategories();
  }, [inputValue]);

  const handleSelectCategory = (category) => {
    const isCategorySelected = selectedCategories.some(
      (selectedCategory) => selectedCategory.id === category.id
    );

    if (!isCategorySelected) {
      if (selectedCategories.length >= 5) {
        const updatedCategories = selectedCategories.slice(1);
        setSelectedCategories([...updatedCategories, category]);
      } else {
        setSelectedCategories([...selectedCategories, category]);
      }
    }

    setInputValue("");
    setFilteredCategories([]);
  };

  const handleRemoveCategory = (id) => {
    setSelectedCategories(selectedCategories.filter((cat) => cat.id !== id));
  };

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const imageFile = e.target.files[0];
      const imageUrl = URL.createObjectURL(imageFile);
      setSelectedImage(imageUrl);
      setPreviewImage(imageFile);
    }
  };

  const location = useLocation();
  const { data } = location.state;
  const [title, setTitle] = useState("");
  const body = useRef("");
  const [info, setInfo] = useState("");

  const trimTitle = (input) => {
    if (input.length > 45) {
      return input.substring(0, 45);
    }
    return input;
  };

  const trimInfo = (input) => {
    if (input.length > 210) {
      return input.substring(0, 210);
    }
    return input;
  };

  useEffect(() => {
    setSelectedCategories(data.article_categories);
    setTitle(trimTitle(localStorage.getItem("articleUpdateTitle")));
    setInfo(trimInfo(data.body_text));

    const loadContent = async () => {
      body.current = await getItem("articleUpdateContent");
    };
    loadContent();
  }, [data]);

  const handleTitleChange = (e) => {
    if(e.target.value.length > maxCharLimit) return;
    setTitle(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleInfoChange = (e) => {
    if(e.target.value.length > 210) return;
    setInfo(e.target.value);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (selectedCategories.length < 1) {
      setErrorMssg("Select atleast one category");
      setError(true);
      return;
    }

    const formData = new FormData();
    formData.append("article_id", data.article_id);
    formData.append("article_title", title);
    formData.append("article_body", body.current);
    formData.append("preview_id", data.article_preview_id);
    formData.append("preview_title", title);
    formData.append("preview_subtitle", trimInfo(info));
    formData.append(
      "updated_categories",
      JSON.stringify(selectedCategories.map((cat) => ({ id: cat.id })))
    );

    if (previewImage) {
      formData.append("updated_preview_image", previewImage);
    }

    try {
      const response = await updateArticle(formData);
      if (response.status == 200) {
        alert("Article Updated successfully");
        window.location.href = "/profile/articles";
      }
    } catch (error) {
      if (error.response.status == 403) {
        logout();
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Article</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section
          id="content"
          className="s-content s-content--page"
          style={{ paddingTop: "100px" }}
        >
          <div
            className="u-fullwidth d-flex flex-column justify-content-center align-items-center"
            style={{ marginTop: "50px" }}
          >
            <div className="publish-page-columns" style={{ margin: "5px 0" }}>
              <div className="top-container">
                <div className="category-input-container">
                  <label
                    htmlFor="categoryInput"
                    style={{ marginBottom: "8px" }}
                  >
                    Update Categories
                  </label>
                  <input
                    type="text"
                    placeholder="Type category..."
                    id="categoryInput"
                    className="u-fullwidth category-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    style={{ marginBottom: "5px" }}
                    required
                  />
                  <div className="dropdown-mod">
                    <ul
                      className={`dropdown-menu ${
                        isDropdownOpen && filteredCategories.length > 0
                          ? "dropdown-menu-active"
                          : ""
                      }`}
                    >
                      {Array.isArray(filteredCategories) &&
                        filteredCategories.map((category) => (
                          <li
                            key={category.id}
                            onClick={() => handleSelectCategory(category)}
                            style={{ cursor: "pointer" }}
                            className={`dropdown-item ${
                              category.id ? "dropdown-item-active" : ""
                            }`}
                          >
                            {category.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className="main-tags-div">
                  {error && (
                    <div style={{ marginTop: "2.2rem" }}>
                      <ErrorMessage isError={error} errorMssg={errorMssg} />
                    </div>
                  )}

                  {selectedCategories.length > 0 && (
                    <>
                      {" "}
                      <label
                        htmlFor="categoryInput"
                        style={{ marginBottom: "8px" }}
                        className="tags-label"
                      >
                        Selected Categories{" "}
                        {selectedCategories.length > 1 ? "(only 5)" : null}
                      </label>
                      <div className="tags-div">
                        {selectedCategories.map((category) => (
                          <p key={category.id} className="main-tagspan">
                            <span className="selected-tagspan">
                              {category.name}
                              <span
                                onClick={() =>
                                  handleRemoveCategory(category.id)
                                }
                                className="selected-tagspan-cross"
                              >
                                ✖
                              </span>
                            </span>
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div
              className="publish-page-columns mid-page"
              style={{ margin: "5px 0" }}
            >
              <div className="column lg-5">
                {/* Hidden input for file selection */}
                <label htmlFor="imageInput" style={{ marginBottom: "8px" }}>
                  Update Preview Image
                </label>
                <input
                  type="file"
                  id="imageInput"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                  required
                />
                {/* Div acting as a button for selecting an image */}
                <div
                  className="input-image"
                  style={{
                    backgroundImage: selectedImage
                      ? `url(${selectedImage})`
                      : "none",
                  }}
                  onClick={() => document.getElementById("imageInput").click()}
                >
                  {!selectedImage && (
                    <span style={{ fontSize: "24px", color: "gray" }}>
                      <img
                        src={addIcon}
                        alt="Add Icon"
                        style={{ width: "70px", height: "70px", margin: "0" }}
                      />
                    </span>
                  )}
                </div>
                <div style={{ marginTop: "15px" }}>
                  <p className="publish-input-info-text">
                    This image wil replace previous image. Include a
                    high-quality image in your article to make it more
                    attractive to readers.
                  </p>
                </div>
              </div>
              <div className="column lg-5">
                <div>
                  <div style={{position: "relative"}}>
                  <label htmlFor="previewTitle" style={{ marginBottom: "8px" }}>
                    Update Preview Title
                  </label>
                  <input
                    type="text"
                    placeholder="Preview Title"
                    id="previewTitle"
                    className="title-input"
                    value={title}
                    onChange={handleTitleChange}
                    required
                  />
                  <p
                    style={{
                      position: "absolute",
                      padding: "0 1px 0 5px",
                      top: "66px",
                      right: "1px",
                      bottom: "1px",
                      fontSize: "12px",
                      marginBottom: "0",
                      color: charCount > maxCharLimit ? "red" : "gray",
                    }}
                  >
                    {maxCharLimit - charCount} characters remaining
                  </p>
                  </div>
                  <label htmlFor="previewInfo" style={{ marginBottom: "8px" }}>
                    Update Preview Info
                  </label>
                  <textarea
                    className="info-input"
                    placeholder="Preview Info Max(210 characters)"
                    id="previewInfo"
                    value={info}
                    onChange={handleInfoChange}
                    required
                  ></textarea>
                </div>
                <div>
                  <p className="publish-input-info-text">
                    Changes here will affect how the story appears in public
                    places like SparkNest homepage, preview banners but not the
                    contents of the articles.
                  </p>
                </div>
              </div>
            </div>
            <div className="publish-page-columns" style={{ margin: "5px 0" }}>
              <div className="bottom-container">
                <div className="category-button-container">
                  <button
                    className="btn--primary create-input-button"
                    type="submit"
                    id="publishButton"
                    onClick={handleSave}
                    style={{ marginTop: "32px !important" }}
                  >
                    <span style={{ display: "block", textAlign: "center" }}>
                      Update
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <MoveToEffect />
    </>
  );
};

export default UpdatePublish;
