import { getProfileArticlePreviews } from "../../../api/ARTICLESAPI";

import RenderPreviews from "../RenderPreviews";

const ShowArticles = (prop) => {
  const url = getProfileArticlePreviews(prop.uid);
  const type = 101; //Profile = 101

  return (
    <>
      <RenderPreviews url={url} type={type}/>
    </>
  );
};

export default ShowArticles;
