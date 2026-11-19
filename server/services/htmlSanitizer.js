import sanitizeHtml from "sanitize-html";

// Quill stores inline colors/backgrounds in style attributes and uses classes
// for align/indent/size. Allow only the CSS properties Quill emits.
const safeColor =
  /^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|transparent)$/i;
const safeAlign = /^(left|right|center|justify)$/i;

const options = {
  allowedTags: [
    "p",
    "br",
    "span",
    "div",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "sub",
    "sup",
    "a",
    "img",
    "video",
    "source",
    "iframe",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
  ],
  allowedAttributes: {
    "*": ["class", "style"],
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    video: ["src", "controls", "poster", "width", "height"],
    source: ["src", "type"],
    iframe: ["src", "frameborder", "allowfullscreen", "width", "height"],
    li: ["data-list"],
    span: ["data-value"],
    div: ["data-language"],
  },
  allowedStyles: {
    "*": {
      color: [safeColor],
      "background-color": [safeColor],
      "text-align": [safeAlign],
    },
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

/**
 * Sanitize Quill article HTML before storing and before serving it.
 * Returns an empty string for non-string input.
 */
export function sanitizeArticleHtml(html) {
  if (typeof html !== "string") return "";
  return sanitizeHtml(html, options);
}
