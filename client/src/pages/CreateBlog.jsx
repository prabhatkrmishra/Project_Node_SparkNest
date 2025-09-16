import { Helmet } from "react-helmet";
import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; 
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import MoveToEffect from "./components/effects/MoveToEffect";

const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    const toolbarOptions = [
      [
        "bold",
        "italic",
        "underline",
        "strike",
        { list: "ordered" },
        { list: "bullet" },
        { list: "check" },
        { direction: "rtl" },
        { indent: "-1" },
        { indent: "+1" },
        { align: [] }
      ],
      [{ script: "sub" }, { script: "super" }, "formula"],
      [{ header: 1 }, { header: 2 }, "blockquote", "code-block"],
      ["link", "image", "video"],
      [{ size: ["small", false, "large", "huge"] }, { header: [1, 2, 3, 4, 5, 6, false] },{ font: [] }],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ];

    const quill = new Quill(editorRef.current, {
      modules: {
        syntax: { hljs },
        toolbar: toolbarOptions,
      },
      theme: 'snow',
      placeholder: 'Type your Article...',
    });

    quillRef.current = quill;

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function cleanEditorContent() {
      const unwantedText = '<p>PlainBashC++C#CSSDiffHTML/XMLJavaJavaScriptMarkdownPHPPythonRubySQL</p>';
      const escapedText = escapeRegExp(unwantedText);
      const regex = new RegExp(escapedText, 'g');
      let editorHtml = quill.root.innerHTML;
      editorHtml = editorHtml.replace(regex, '');
      quill.root.innerHTML = editorHtml;
    }

    cleanEditorContent();

    quill.getModule('toolbar').addHandler('link', function () {
      const href = prompt('Enter the link URL');
      if (href) {
        const fullUrl = /^https?:\/\//i.test(href) ? href : 'http://' + href;
        const range = this.quill.getSelection();
        if (range) {
          this.quill.formatText(range.index, range.length, 'link', fullUrl);
        }
      }
    });

  }, []);

  const handleSave = (event) => {
    event.preventDefault();
    if (quillRef.current) {
      console.log(quillRef.current.container.innerHTML);
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
        <section id="content" className="s-content s-content--page" style={{paddingTop: "100px"}}>
          <div className="row">
            <div className="column lg-6 tab-12" style={{ width: "100%" }}>
              <form onSubmit={handleSave}>
                <div className="d-flex flex-row justify-content-between  align-items-center gap-2">
                  <label htmlFor="titleInput"></label>
                  <input
                    className="u-fullwidth"
                    type="text"
                    placeholder="Title"
                    id="titleInput"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                <input
                  className="btn--primary"
                  type="submit"
                  id="subbmitButton"
                />
                </div>
                <div id="editor" ref={editorRef}></div>
              </form>
            </div>
          </div>
        </section>
      </div>
      <MoveToEffect />
    </>
  );
};

export default CreateBlog;
