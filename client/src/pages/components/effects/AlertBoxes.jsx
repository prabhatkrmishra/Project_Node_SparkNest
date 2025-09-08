import { useEffect } from "react";

const AlertBoxes = () => {
  useEffect(() => {
    const boxes = document.querySelectorAll(".alert-box");
    boxes.forEach((box) => {
      box.addEventListener("click", (event) => {
        if (event.target.matches(".alert-box__close")) {
          event.stopPropagation();
          event.target.parentElement.classList.add("hideit");
          setTimeout(() => {
            box.style.display = "none";
          }, 500);
        }
      });
    });

    return () => {
      boxes.forEach((box) => {
        box.removeEventListener("click", (event) => {
          if (event.target.matches(".alert-box__close")) {
            event.stopPropagation();
            event.target.parentElement.classList.add("hideit");
            setTimeout(() => {
              box.style.display = "none";
            }, 500);
          }
        });
      });
    };
  }, []);

  return null;
};

export default AlertBoxes;
