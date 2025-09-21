import ShowArticles from "./ShowArticles"
import ShowSaved from "./ShowSaved";
import ShowLiked from "./ShowLiked";

const GetPreviews = (prop) => {
  return (
    <>
      {prop.renderCategory === "articles" && <ShowArticles uid={prop.userId}/>}
      {prop.renderCategory === "collections" && <ShowSaved uid={prop.userId}/>}
      {prop.renderCategory === "liked" && <ShowLiked uid={prop.userId}/>}
    </>
  );
};

export default GetPreviews;
